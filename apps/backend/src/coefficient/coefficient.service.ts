import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  SortBy,
  calculateClubCoefficients,
  calculateCoefficientData,
  getSeasonsForCoefficientcalculation,
  getWinners,
  isNotEmpty,
  prepareClub,
  sortCoefficientData,
} from "@fbs2.0/utils";
import {
  RawCoefficientData,
  CountryCoefficient,
  TORNAMENT_PARTICIPATION_ORDERING,
  CoefficientHistoryItem,
  StageType,
} from "@fbs2.0/types";

import { ClubCoefficient } from "./entities/club-coefficient.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Match } from "../match/entities/match.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { Country } from "../country/entities/country.entity";

@Injectable()
export class CoefficientService {
  @InjectRepository(ClubCoefficient)
  private readonly clubCoefficientRepository: Repository<ClubCoefficient>;

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  @InjectRepository(Participant)
  private readonly participantRepository: Repository<Participant>;

  @InjectRepository(TournamentSeason)
  private readonly tournamentSeasonRepository: Repository<TournamentSeason>;

  @InjectRepository(Country)
  private readonly countryRepository: Repository<Country>;

  public async getCountryCoefficient(forSeason: string) {
    const data: RawCoefficientData[] = (
      await Promise.all(
        getSeasonsForCoefficientcalculation(forSeason).map(
          async ({ label, key }) => ({
            season: label,
            key,
            data: await this.getAllSeasonClubCoefficients(label),
          })
        )
      )
    ).sort((a, b) => a.key - b.key);

    return calculateCoefficientData(data, forSeason);
  }

  public async getAllSeasonClubCoefficients(season: string) {
    const startOfSeason = (season || "").split("-")[0];

    const coefficients = await this.clubCoefficientRepository.find({
      where: { tournamentSeason: { season } },
      relations: {
        club: {
          oldNames: true,
          city: { oldNames: { country: true }, country: true },
        },
        tournamentSeason: true,
      },
    });

    return coefficients
      .reduce<CountryCoefficient[]>(
        (acc, { club: rawClub, coefficient, tournamentSeason }) => {
          const countryIdx = acc.findIndex(({ country }) => {
            const {
              country: { id: countryId },
              oldNames,
            } = rawClub.city;

            if (oldNames.length > 0) {
              const oldName = [...(oldNames || [])]
                .sort((a, b) => Number(a.till) - Number(b.till))
                .find(({ till }) => Number(till) > Number(startOfSeason));

              if (isNotEmpty(oldName?.country)) {
                return oldName?.country?.id === country?.id;
              }
            }

            return country.id === countryId;
          });

          const club = prepareClub(rawClub, startOfSeason);

          if (countryIdx < 0) {
            acc.push({
              country: club.city.country,
              clubs: [
                {
                  club,
                  coefficient: 0,
                  participations: [
                    { tournament: tournamentSeason.tournament, coefficient },
                  ],
                },
              ],
              coefficient: 0,
            });
          } else {
            const clubIdx = acc[countryIdx].clubs.findIndex(
              (clubCoefficient) => clubCoefficient.club.id === club.id
            );

            if (clubIdx < 0) {
              acc[countryIdx].clubs.push({
                club,
                coefficient: 0,
                participations: [
                  { tournament: tournamentSeason.tournament, coefficient },
                ],
              });
            } else {
              acc[countryIdx].clubs[clubIdx].participations.push({
                tournament: tournamentSeason.tournament,
                coefficient,
              });
            }
          }

          return acc;
        },
        []
      )
      .map((country) => {
        const clubs = country.clubs
          .map((club) => ({
            ...club,
            participations: [...club.participations].sort((a, b) => {
              const aIdx = TORNAMENT_PARTICIPATION_ORDERING.indexOf(
                a.tournament
              );

              const bIdx = TORNAMENT_PARTICIPATION_ORDERING.indexOf(
                b.tournament
              );

              return aIdx - bIdx;
            }),
            coefficient: club.participations.reduce<number>(
              (acc, { coefficient }) => acc + coefficient,
              0
            ),
          }))
          .sort((a, b) => b.coefficient - a.coefficient);

        return {
          ...country,
          clubs,
          coefficient:
            Math.floor(
              (clubs.reduce<number>(
                (acc, { coefficient }) => acc + (coefficient || 0),
                0
              ) /
                clubs.length) *
                1000
            ) / 1000,
        };
      });
  }

  public async calculateSeasonClubCoefficients(season: string) {
    const participants = await this.participantRepository.find({
      where: { tournamentSeason: { season } },
      relations: { club: true, tournamentSeason: true },
    });

    const matches = await this.matchRepository.find({
      where: {
        stage: {
          tournamentSeason: { season },
        },
      },
      relations: {
        stage: {
          tournamentSeason: true,
          stageScheme: true,
          previousStage: true,
        },
        host: {
          club: {
            city: { country: true, oldNames: { country: true } },
            oldNames: true,
          },
        },
        guest: {
          club: {
            city: { country: true, oldNames: { country: true } },
            oldNames: true,
          },
        },
      },
    });

    const currentCoefficients = await this.clubCoefficientRepository.find({
      where: { tournamentSeason: { season } },
      relations: { club: true, tournamentSeason: true },
    });

    return Promise.all(
      calculateClubCoefficients(
        participants,
        matches,
        Number(season.split("-")[0])
      ).map(async ({ participant, coefficient, tournament }) => {
        const tournamentSeason = await this.tournamentSeasonRepository.findOne({
          where: { tournament, season },
        });

        const currentCoefficient = currentCoefficients.find(
          ({ club, tournamentSeason: savedTournamentSeason }) =>
            club.id === participant.club.id &&
            savedTournamentSeason.id === tournamentSeason.id
        );

        if (currentCoefficient?.coefficient === coefficient) {
          return false;
        }

        const clubCoefficient = currentCoefficient || new ClubCoefficient();

        clubCoefficient.coefficient = coefficient;
        clubCoefficient.club = participant.club;
        clubCoefficient.tournamentSeason = tournamentSeason;

        await this.clubCoefficientRepository.save(clubCoefficient);

        return true;
      })
    ).then((results) => results.filter((result) => !!result).length);
  }

  public async getCountryCoefficientHistory(countryId: number) {
    const country = await this.countryRepository.findOne({
      where: { id: countryId },
    });

    const seasons = [
      ...new Set(
        (
          await this.tournamentSeasonRepository.find({
            select: { season: true },
          })
        )
          .map(({ season }) => season)
          .filter((season) => {
            if (isNotEmpty(country.till)) {
              return Number(season.split("-")[0]) <= Number(country.till);
            }

            if (isNotEmpty(country.from)) {
              return Number(season.split("-")[0]) >= Number(country.from);
            }

            return true;
          })
          .sort((a, b) => {
            const aStart = Number(a.split("-")[0]);
            const bStart = Number(b.split("-")[0]);

            return aStart - bStart;
          })
      ),
    ];

    const graphData: (CoefficientHistoryItem | null)[] = [];

    for await (const season of seasons) {
      const sortedCoefficients = sortCoefficientData(
        await this.getCountryCoefficient(season),
        SortBy.Total
      );

      const countryItemIdx = sortedCoefficients.findIndex(
        ({ country }) => country.id === countryId
      );

      const places = sortedCoefficients.length;

      if (countryItemIdx < 0) {
        graphData.push({
          season,
          place: null,
          places,
          rank: null,
          totalCoefficient: null,
        });
      } else {
        const { totalCoefficient } = sortedCoefficients[countryItemIdx];

        graphData.push({
          season,
          place: countryItemIdx + 1,
          places,
          rank: 1 - (countryItemIdx + 1) / places + 1 / places,
          totalCoefficient: Number(totalCoefficient.toFixed(3)),
        });
      }
    }

    return graphData;
  }

  public async getWinners(season: string) {
    const finalMatches = await this.matchRepository.find({
      relations: {
        stage: {
          tournamentSeason: true,
          stageScheme: true,
        },
        host: {
          club: {
            city: { country: true, oldNames: { country: true } },
            oldNames: true,
          },
        },
        guest: {
          club: {
            city: { country: true, oldNames: { country: true } },
            oldNames: true,
          },
        },
        forceWinner: {
          club: {
            city: { country: true, oldNames: { country: true } },
            oldNames: true,
          },
        },
      },
      where: {
        stage: {
          stageType: StageType.FINAL,
          tournamentSeason: { season },
        },
      },
      order: { date: "ASC" },
    });

    return getWinners(finalMatches);
  }
}

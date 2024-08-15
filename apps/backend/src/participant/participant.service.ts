import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  GROUP_STAGES,
  Group,
  GroupRow,
  SeasonParticipants,
  SeasonParticipantsClubParticipation,
  StageTableData,
  StageType,
  TORNAMENT_PARTICIPATION_ORDERING,
  Tournament,
} from "@fbs2.0/types";
import {
  isGroupFinished,
  isNotEmpty,
  prepareClub,
  prepareMatchesList,
  transformTournamentPart,
} from "@fbs2.0/utils";

import { Participant } from "./entities/participant.entity";
import { Club } from "../club/entities/club.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { Stage } from "../match/entities/stage.entity";
import { getSecuencedStagesList } from "../shared/utils";
import { Match } from "../match/entities/match.entity";

@Injectable()
export class ParticipantService {
  @InjectRepository(Participant)
  private readonly participantRepository: Repository<Participant>;

  @InjectRepository(Club)
  private readonly clubRepository: Repository<Club>;

  @InjectRepository(TournamentSeason)
  private readonly tournamentSeasonRepository: Repository<TournamentSeason>;

  @InjectRepository(Stage)
  private readonly stageRepository: Repository<Stage>;

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  private findParticipants(
    season: string,
    tournament?: Tournament
  ): Promise<Participant[]> {
    return this.participantRepository.find({
      relations: {
        tournamentSeason: true,
        club: {
          city: { country: true, oldNames: { country: true } },
          oldNames: true,
        },
        fromStage: { tournamentSeason: true, stageSubstitutions: true },
      },
      where: {
        tournamentSeason: { season, ...(tournament ? { tournament } : {}) },
      },
      ...(tournament
        ? { order: { club: { city: { country: { name: "ASC" } } } } }
        : {}),
    });
  }

  public getParticipants(
    season: string,
    tournament: Tournament
  ): Promise<Participant[]> {
    return this.findParticipants(season, tournament);
  }

  public async getAllSeasonParticipants(
    season: string
  ): Promise<SeasonParticipants[]> {
    const seasonParticipants = await this.findParticipants(season);
    const startOfSeason = (season || "").split("-")[0];

    const prepareParticipation = ({
      id,
      tournamentSeason,
      fromStage,
      startingStage,
    }: Participant): SeasonParticipantsClubParticipation => ({
      id,
      fromStage,
      startingStage,
      tournament: tournamentSeason.tournament,
    });

    return seasonParticipants
      .reduce<SeasonParticipants[]>((acc, participant) => {
        const countryIndex = acc.findIndex(({ country }) => {
          const {
            country: { id: countryId },
            oldNames,
          } = participant.club.city;

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

        const club = prepareClub(participant.club, startOfSeason);

        if (countryIndex === -1) {
          acc.push({
            country: club.city.country,
            clubs: [
              {
                club,
                participations: [prepareParticipation(participant)],
              },
            ],
          });
        } else {
          const clubIndex = acc[countryIndex].clubs.findIndex(
            ({ club }) => club.id === participant.club.id
          );

          if (clubIndex === -1) {
            acc[countryIndex].clubs.push({
              club,
              participations: [prepareParticipation(participant)],
            });
          } else {
            acc[countryIndex].clubs[clubIndex].participations.push(
              prepareParticipation(participant)
            );
          }
        }

        return acc;
      }, [])
      .map((seasonParticipant) => ({
        ...seasonParticipant,
        clubs: [
          ...seasonParticipant.clubs.map((club) => ({
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
          })),
        ],
      }));
  }

  public async createParticipant(
    season: string,
    tournament: Tournament,
    clubId: number,
    startingStage: StageType
  ): Promise<Participant> {
    const participant = new Participant();

    const club = await this.clubRepository.findOne({ where: { id: clubId } });

    const tournamentSeason = await this.tournamentSeasonRepository.findOne({
      where: { tournament, season },
    });

    participant.startingStage = startingStage;
    participant.club = club;
    participant.tournamentSeason = tournamentSeason;

    return this.participantRepository.save(participant);
  }

  public async editParticipant(
    participantId: number,
    clubId: number,
    startingStage: StageType
  ): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId },
    });

    const club = await this.clubRepository.findOne({ where: { id: clubId } });

    participant.startingStage = startingStage;
    participant.club = club;

    return this.participantRepository.save(participant);
  }

  public async removeParticipant(id: number) {
    const participant = await this.participantRepository.findOne({
      where: { id },
    });

    return this.participantRepository.remove(participant);
  }

  private async addParticipantsToStage(
    fromTournamentSeason: TournamentSeason,
    fromStageType: StageType,
    toTournamentType: Tournament,
    toStageType: StageType
  ) {
    const stages = await this.stageRepository.find({
      relations: {
        previousStage: true,
        stageScheme: true,
        stageSubstitutions: true,
      },
      where: {
        tournamentSeason: {
          tournament: fromTournamentSeason.tournament,
          season: fromTournamentSeason.season,
        },
      },
    });

    const sequencedStages = getSecuencedStagesList(stages);

    const donorStageIdx = sequencedStages.findIndex(
      (stage) => stage.stageType === fromStageType
    );

    if (donorStageIdx < 0) {
      return;
    }

    const donorTournamentPart = sequencedStages.slice(0, donorStageIdx + 1);

    const allMatches = await this.matchRepository.find({
      relations: {
        stage: {
          tournamentSeason: true,
          stageScheme: true,
          previousStage: true,
        },
        host: { club: { city: { country: true }, oldNames: true } },
        guest: { club: { city: { country: true }, oldNames: true } },
      },
      where: {
        stage: {
          tournamentSeason: {
            tournament: fromTournamentSeason.tournament,
            season: fromTournamentSeason.season,
          },
        },
      },
    });

    const availableMatches = prepareMatchesList(allMatches);

    const donorStageData = donorTournamentPart
      .map((tournamentStage) => {
        const existedStage = availableMatches.find(
          ({ stage }) => stage.stageType === tournamentStage.stageType
        );

        return (
          existedStage || {
            stage: tournamentStage,
            matches: [],
          }
        );
      })
      .map(transformTournamentPart)
      .find(({ stage }) => stage.stageType === fromStageType);

    const clubsToBeAdded: Club[] = [];

    if (GROUP_STAGES.includes(donorStageData.stage.stageScheme.type)) {
      Object.values(
        donorStageData.matches as Record<Group, GroupRow[]>
      ).forEach((tableRows) => {
        if (isGroupFinished(tableRows, donorStageData.stage.stageScheme.type)) {
          clubsToBeAdded.push(tableRows[2].team.club);
        }
      });
    } else {
      (donorStageData.matches as StageTableData).rows.forEach(
        ({ host, guest }) => {
          if (host.isWinner === false) {
            clubsToBeAdded.push(host.club);
          }

          if (guest.isWinner === false) {
            clubsToBeAdded.push(guest.club);
          }
        }
      );
    }

    const acceptorTournamentSeason =
      await this.tournamentSeasonRepository.findOne({
        where: {
          tournament: toTournamentType,
          season: fromTournamentSeason.season,
        },
      });

    const existedParticipants = await this.participantRepository.find({
      where: {
        tournamentSeason: {
          season: acceptorTournamentSeason.season,
          tournament: acceptorTournamentSeason.tournament,
        },
        startingStage: toStageType,
      },
      relations: { club: true },
    });

    const existedClubsIds = existedParticipants.map(({ club }) => club.id);

    return Promise.all(
      clubsToBeAdded.map(async (club) => {
        if (existedClubsIds.includes(club.id)) {
          return { clubId: club.id, result: false };
        }

        const participant = new Participant();

        participant.club = club;
        participant.fromStage = donorStageData.stage;
        participant.tournamentSeason = acceptorTournamentSeason;
        participant.startingStage = toStageType;

        const result = await this.participantRepository.save(participant);

        return { clubId: club.id, result: !!result };
      })
    );
  }

  public async addParticipantsFromAnotherTournament(
    season: string,
    tournament: Tournament
  ): Promise<number> {
    const donorStages = await this.stageRepository.find({
      relations: {
        tournamentSeason: true,
        stageSubstitutions: true,
      },
      where: {
        tournamentSeason: { season },
        linkedTournament: tournament,
      },
    });

    const result = await Promise.all(
      donorStages.map(
        async ({
          stageType: fromStageType,
          tournamentSeason: fromTournamentSeason,
          linkedTournament,
          linkedTournamentStage,
        }) =>
          await this.addParticipantsToStage(
            fromTournamentSeason,
            fromStageType,
            linkedTournament,
            linkedTournamentStage
          )
      )
    );

    return result.flat().filter(({ result }) => result === true).length;
  }

  public async copyParticipantsFromPreviousSeason(
    season: string,
    tournament: Tournament
  ) {
    const [start, finish] = season.split("-").map((item) => Number(item));
    const previousSeason = `${start - 1}-${finish - 1}`;

    const participants = await this.participantRepository.find({
      where: {
        tournamentSeason: { season: previousSeason, tournament },
        fromStage: null,
      },
      relations: { club: true },
    });

    return (
      await Promise.all(
        participants.map(async (participant) => {
          const newParticipant = new Participant();

          const tournamentSeason =
            await this.tournamentSeasonRepository.findOne({
              where: { tournament, season },
            });

          newParticipant.club = participant.club;
          newParticipant.tournamentSeason = tournamentSeason;
          newParticipant.startingStage = participant.startingStage;

          return await this.participantRepository.save(newParticipant);
        })
      )
    ).length;
  }
}

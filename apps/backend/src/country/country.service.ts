import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import {
  _KnockoutStageTableRowResult,
  ClubWithWinner,
  CountryCV,
  CountryCVStatus,
  StageType,
  TournamentSeason,
} from "@fbs2.0/types";
import { getWinner, isNotEmpty, prepareClub } from "@fbs2.0/utils";

import { Country } from "./entities/country.entity";
import { OldCityName } from "../city/entities/old-city-name.entity";
import { Match } from "../match/entities/match.entity";
import { UpdateCountryDto } from "./entities/country.dto";

@Injectable()
export class CountryService {
  @InjectRepository(Country)
  private readonly countryRepository: Repository<Country>;

  @InjectRepository(OldCityName)
  private readonly cityOldNameRepository: Repository<OldCityName>;

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  public getCountries(): Promise<Country[]> {
    return this.countryRepository.find({ order: { name: "ASC" } });
  }

  public async updateCountry(body: UpdateCountryDto): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id: body.id },
    });

    if (isNotEmpty(body.name)) {
      country.name = body.name;
    }

    if (isNotEmpty(body.till)) {
      country.till = body.till;
    }

    if (isNotEmpty(body.from)) {
      country.from = body.from;
    }

    return this.countryRepository.save(country);
  }

  private async getFinalMatchesForCountry(country: Country | undefined) {
    const baseFindMatchesOptions: FindManyOptions<Match> = {
      relations: {
        stage: { tournamentSeason: true, stageScheme: true },
        forceWinner: { club: true },
        host: {
          club: {
            city: { country: true, oldNames: { city: true, country: true } },
            oldNames: true,
          },
        },
        guest: {
          club: {
            city: { country: true, oldNames: { city: true, country: true } },
            oldNames: true,
          },
        },
      },
      order: { date: "ASC" },
    };

    if (isNotEmpty(country?.till)) {
      const cityIds = (
        await this.cityOldNameRepository.find({
          relations: { city: { country: true } },
          where: { country: { id: country?.id } },
        })
      ).reduce<number[]>((acc, { city }) => {
        return acc.includes(city.id) ? acc : [...acc, city.id];
      }, []);

      return (
        await Promise.all(
          cityIds.map(
            async (cityId) =>
              await this.matchRepository.find({
                ...baseFindMatchesOptions,
                where: [
                  { host: { club: { city: { id: cityId } } } },
                  { guest: { club: { city: { id: cityId } } } },
                ],
              })
          )
        )
      )
        .flat()
        .sort((a, b) => {
          const aStart = Number(a.stage.tournamentSeason.season.split("-")[0]);
          const bStart = Number(b.stage.tournamentSeason.season.split("-")[0]);

          return aStart - bStart;
        })
        .filter(
          ({ stage }) =>
            stage.stageType === StageType.FINAL &&
            Number(country?.till) >=
              Number(stage.tournamentSeason.season.split("-")[0])
        );
    }

    return (
      await this.matchRepository.find({
        ...baseFindMatchesOptions,
        where: [
          { host: { club: { city: { country: { id: country?.id } } } } },
          { guest: { club: { city: { country: { id: country?.id } } } } },
        ],
      })
    ).filter(({ stage }) => stage.stageType === StageType.FINAL);
  }

  public async getCountryCV(countryId: number) {
    const country = await this.countryRepository.findOne({
      where: { id: countryId },
    });

    return (await this.getFinalMatchesForCountry(country))
      .reduce<{ t: TournamentSeason; m: Match[] }[]>((acc, match) => {
        const existedTournamentSeasonIdx = acc.findIndex(
          ({ t }) => t.id === match.stage.tournamentSeason.id
        );

        if (existedTournamentSeasonIdx >= 0) {
          acc[existedTournamentSeasonIdx].m.push(match);
        } else {
          acc.push({ t: match.stage.tournamentSeason, m: [match] });
        }

        return acc;
      }, [])
      .map<CountryCV>((finalData) => {
        const finalResults = finalData.m.map<_KnockoutStageTableRowResult>(
          ({ hostScore, guestScore, hostPen, guestPen, answer }) => ({
            hostScore: answer ? guestScore : hostScore,
            guestScore: answer ? hostScore : guestScore,
            hostPen: answer ? guestPen : hostPen,
            guestPen: answer ? hostPen : guestPen,
            answer,
          })
        );

        const latestMatch =
          finalData.m.length > 0 ? finalData.m[finalData.m.length - 1] : null;

        const winnerInfo = getWinner(
          finalResults,
          latestMatch?.stage.stageScheme.awayGoal,
          isNotEmpty(latestMatch.forceWinner)
            ? latestMatch.answer
              ? latestMatch.forceWinner.id === latestMatch.host.id
                ? "guest"
                : "host"
              : latestMatch.forceWinner.id === latestMatch.host.id
              ? "host"
              : "guest"
            : undefined
        );

        const rawHost: ClubWithWinner = {
          ...(latestMatch.answer ? latestMatch.guest : latestMatch.host),
          isWinner: winnerInfo.host,
        };

        const rawGuest: ClubWithWinner = {
          ...(latestMatch.answer ? latestMatch.host : latestMatch.guest),
          isWinner: winnerInfo.guest,
        };

        let monoFinal =
          rawHost.club.city.country.id === rawGuest.club.city.country.id;

        let isWinner =
          (rawHost.club.city.country.id === countryId && rawHost.isWinner) ||
          (rawGuest.club.city.country.id === countryId && rawGuest.isWinner);

        const year = finalData.t.season.split("-")[0];

        const host = { ...rawHost, club: prepareClub(rawHost.club, year) };
        const guest = { ...rawGuest, club: prepareClub(rawGuest.club, year) };

        if (isNotEmpty(country?.till)) {
          monoFinal = host.club.city.country.id === guest.club.city.country.id;

          isWinner =
            (host.club.city.country.id === countryId && host.isWinner) ||
            (guest.club.city.country.id === countryId && guest.isWinner);
        }

        return {
          tournamentSeason: finalData.t,
          host,
          guest,
          status: monoFinal
            ? CountryCVStatus.Both
            : isWinner
            ? CountryCVStatus.Winner
            : CountryCVStatus.RunnerUp,
        };
      });
  }
}

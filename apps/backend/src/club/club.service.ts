import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import {
  KnockoutStageTableRowResult,
  Balance,
  ClubCV,
  _OldClubNameDto,
  StageType,
} from "@fbs2.0/types";
import { getWinner, isNotEmpty } from "@fbs2.0/utils";

import { Club } from "./entities/club.entity";
import { _CreateClubDto } from "./entities/_club.dto";
import { City } from "../city/entities/city.entity";
import { OldClubName } from "./entities/old-club-name.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Match } from "../match/entities/match.entity";
import { Country } from "../country/entities/country.entity";
import { ClubDto } from "./entities/club.dto";

@Injectable()
export class ClubService {
  @InjectRepository(Club)
  private readonly clubRepository: Repository<Club>;

  @InjectRepository(Country)
  private readonly countryRepository: Repository<Country>;

  @InjectRepository(OldClubName)
  private readonly clubOldNameRepository: Repository<OldClubName>;

  @InjectRepository(City)
  private readonly cityRepository: Repository<City>;

  @InjectRepository(Participant)
  private readonly participantRepository: Repository<Participant>;

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  public async createClubOldName(
    clubId: number,
    body: _OldClubNameDto
  ): Promise<OldClubName> {
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    const clubOldName = new OldClubName();

    clubOldName.name = body.name;
    clubOldName.till = body.till;
    clubOldName.club = club;

    return this.clubOldNameRepository.save(clubOldName);
  }

  public async removeClubOldName(clubOldNameId: number) {
    const clubOldName = await this.clubOldNameRepository.findOne({
      where: { id: clubOldNameId },
    });

    return this.clubOldNameRepository.remove(clubOldName);
  }

  public async getClubs(countryId: number | undefined): Promise<Club[]> {
    const findOptions: FindManyOptions<Club> = {
      relations: {
        city: { country: true, oldNames: { country: true } },
        oldNames: true,
      },
    };

    if (countryId) {
      const country = await this.countryRepository.findOne({
        where: { id: countryId },
      });

      if (!country) {
        throw new NotFoundException();
      }

      findOptions.where = { city: { country: { id: countryId } } };
    }

    return await this.clubRepository.find(findOptions);
  }

  public getClub(id: number): Promise<Club> {
    return this.clubRepository.findOne({
      where: { id },
      relations: { oldNames: true },
    });
  }

  public async _createClub(body: _CreateClubDto): Promise<Club> {
    const club: Club = new Club();

    club.name = body.name;

    const city = await this.cityRepository.findOne({
      where: { id: body.cityId },
    });

    club.city = city;

    return this.clubRepository.save(club);
  }

  public async _updateClub(body: Club) {
    const club = await this.clubRepository.findOne({ where: { id: body.id } });

    if (isNotEmpty(body.name)) {
      club.name = body.name;
    }

    const city = await this.cityRepository.findOne({
      where: { id: body.city.id },
    });

    club.city = city;

    return await this.clubRepository.save(club);
  }

  public async removeClub(clubId: number) {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: { oldNames: true },
    });

    if (!club) {
      throw new NotFoundException();
    }

    if (club.oldNames.length > 0) {
      club.oldNames.forEach(
        async (item) => await this.clubOldNameRepository.remove(item)
      );
    }

    return await this.clubRepository.remove(club);
  }

  public async createClub(body: ClubDto): Promise<Club> {
    const club = new Club();

    club.name = body.name;
    club.name_ua = body.name_ua;

    const city = await this.cityRepository.findOne({
      where: { id: body.cityId },
      relations: { country: true },
    });

    club.city = city;

    club.oldNames = await Promise.all(
      body.oldNames.map(async ({ name, name_ua, till }) => {
        const oldClubName = new OldClubName();

        oldClubName.name = name;
        oldClubName.name_ua = name_ua;
        oldClubName.till = till;

        return oldClubName;
      })
    );

    return this.clubRepository.save(club);
  }

  public async updateClub(clubId: number, body: ClubDto): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: { oldNames: true },
    });

    club.name = body.name;
    club.name_ua = body.name_ua;

    const updatedClub = await this.clubRepository.save(club);

    await Promise.all(
      club.oldNames.map(async (item) => {
        const dto = body.oldNames.find(({ id }) => item.id === id);

        if (dto) {
          const oldName = new OldClubName();

          oldName.id = dto.id;
          oldName.name = dto.name;
          oldName.name_ua = dto.name_ua;
          oldName.till = dto.till;

          await this.clubOldNameRepository.save(oldName);
        } else {
          await this.clubOldNameRepository.remove(item);
        }
      })
    );

    await Promise.all(
      body.oldNames
        .filter(({ id }) => !id)
        .map(async (item) => {
          const oldName = new OldClubName();

          oldName.name = item.name;
          oldName.name_ua = item.name_ua;
          oldName.till = item.till;
          oldName.club = updatedClub;

          await this.clubOldNameRepository.save(oldName);
        })
    );

    return await this.clubRepository.findOne({
      where: { id: clubId },
      relations: { city: { country: true } },
    });
  }

  public async getClubCV(clubId: number) {
    const participations = await this.participantRepository.find({
      where: { club: { id: clubId } },
      relations: { tournamentSeason: true, club: true },
    });

    const matches = await this.matchRepository.find({
      relations: {
        stage: { tournamentSeason: true, stageScheme: true },
        forceWinner: { club: true },
        host: { club: true },
        guest: { club: true },
      },
      where: [
        { host: { club: { id: clubId } } },
        { guest: { club: { id: clubId } } },
      ],
      order: { date: "ASC" },
    });

    const orderedParticipations = participations
      .map((participation) => {
        const seasonMatches = matches.filter(
          ({
            stage: {
              tournamentSeason: { id },
            },
          }) => id === participation.tournamentSeason.id
        );

        const latestMatch = seasonMatches[seasonMatches.length - 1];
        const finish = latestMatch?.stage.stageType || null;
        let isWinner: boolean;

        if (
          isNotEmpty(latestMatch) &&
          latestMatch?.stage.stageType === StageType.FINAL
        ) {
          const givenClubIsHost = latestMatch.answer
            ? latestMatch.guest.club.id === clubId
            : latestMatch.host.club.id === clubId;

          const finalMatches = seasonMatches.filter(
            ({ stage }) => stage.stageType === StageType.FINAL
          );

          const finalResults = finalMatches.map<KnockoutStageTableRowResult>(
            ({ hostScore, guestScore, hostPen, guestPen, answer, date }) => ({
              hostScore: answer ? guestScore : hostScore,
              guestScore: answer ? hostScore : guestScore,
              hostPen: answer ? guestPen : hostPen,
              guestPen: answer ? hostPen : guestPen,
              answer,
              date,
            })
          );

          const winnerInfo = getWinner(
            finalResults,
            latestMatch.stage.stageScheme.awayGoal,
            isNotEmpty(latestMatch.forceWinner)
              ? givenClubIsHost
                ? latestMatch.forceWinner.club.id === clubId
                  ? "host"
                  : "guest"
                : latestMatch.forceWinner.club.id === clubId
                ? "guest"
                : "host"
              : undefined
          );

          isWinner = givenClubIsHost ? winnerInfo.host : winnerInfo.guest;
        }

        return {
          tournamentSeason: participation.tournamentSeason,
          start: participation.startingStage,
          finish,
          isWinner,
          balance: seasonMatches.reduce<Balance>(
            (acc, { host, hostScore, guest, guestScore, unplayed }) => {
              if (unplayed) {
                acc.u = acc.u + 1;

                return acc;
              }

              if (host.club.id === clubId) {
                if (hostScore > guestScore) {
                  acc.w = acc.w + 1;
                } else if (hostScore < guestScore) {
                  acc.l = acc.l + 1;
                } else if (hostScore === guestScore) {
                  acc.d = acc.d + 1;
                }
              }

              if (guest.club.id === clubId) {
                if (guestScore > hostScore) {
                  acc.w = acc.w + 1;
                } else if (guestScore < hostScore) {
                  acc.l = acc.l + 1;
                } else if (guestScore === hostScore) {
                  acc.d = acc.d + 1;
                }
              }

              return acc;
            },
            { w: 0, d: 0, l: 0, u: 0 }
          ),
        } as ClubCV;
      })
      .sort((a, b) => {
        const aFinish = Number(a.tournamentSeason.season.split("-")[1]);
        const bFinish = Number(b.tournamentSeason.season.split("-")[1]);

        return aFinish < bFinish ? -1 : 1;
      });

    return orderedParticipations;
  }
}

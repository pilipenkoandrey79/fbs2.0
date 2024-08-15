import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { MatchResultDto, Tournament } from "@fbs2.0/types";
import { isNotEmpty, prepareMatchesList } from "@fbs2.0/utils";

import { Match } from "./entities/match.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Stage } from "./entities/stage.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { DeductedPoints } from "./entities/deducted-points.entity";
import { CreateMatchDto } from "./entities/match.dto";
import { DeleteMatchDto } from "./entities/delete-match.dto";
import { getSecuencedStagesList } from "../shared/utils";

@Injectable()
export class MatchService {
  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  @InjectRepository(Participant)
  private readonly participantRepository: Repository<Participant>;

  @InjectRepository(Stage)
  private readonly stageRepository: Repository<Stage>;

  @InjectRepository(TournamentSeason)
  private readonly tournamentSeasonRepository: Repository<TournamentSeason>;

  private async findMatches(season: string, tournament?: Tournament) {
    return await this.matchRepository.find({
      relations: {
        stage: {
          tournamentSeason: true,
          stageScheme: true,
          previousStage: true,
          stageSubstitutions: {
            expelled: {
              club: { city: { country: true, oldNames: true }, oldNames: true },
            },
            sub: {
              club: { city: { country: true, oldNames: true }, oldNames: true },
            },
          },
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
        deductedPointsList: {
          participant: true,
        },
      },
      where: {
        stage: {
          tournamentSeason: { season, ...(tournament ? { tournament } : {}) },
        },
      },
    });
  }

  public async getAllSeasonMatches(season: string) {
    return await this.findMatches(season);
  }

  public async getMatches(season: string, tournament: Tournament) {
    const stages = await this.stageRepository.find({
      relations: {
        previousStage: true,
        stageScheme: true,
        tournamentSeason: true,
        stageSubstitutions: {
          expelled: {
            club: { city: { country: true, oldNames: true }, oldNames: true },
          },
          sub: {
            club: { city: { country: true, oldNames: true }, oldNames: true },
          },
        },
      },
      where: { tournamentSeason: { tournament, season } },
    });

    const matches = await this.findMatches(season, tournament);
    const availableMatches = prepareMatchesList(matches);

    return getSecuencedStagesList(stages).map((tournamentStage) => {
      const existedStage = availableMatches.find(
        ({ stage }) => stage.stageType === tournamentStage.stageType
      );

      return (
        existedStage || {
          stage: tournamentStage,
          matches: [],
        }
      );
    });
  }

  public async createMatch(
    season: string,
    tournament: Tournament,
    {
      stageType,
      hostId,
      guestId,
      answer,
      date,
      replayDate,
      hostScore,
      guestScore,
      hostPen,
      guestPen,
      tour,
      group,
      forceWinnerId,
      unplayed,
      tech,
      deductions = [],
    }: CreateMatchDto
  ) {
    const host = await this.participantRepository.findOne({
      where: { id: hostId },
    });

    const guest = await this.participantRepository.findOne({
      where: { id: guestId },
    });

    const tournamentSeason = await this.tournamentSeasonRepository.findOne({
      where: { tournament, season },
    });

    const stage = await this.stageRepository.findOne({
      where: { tournamentSeason: { id: tournamentSeason.id }, stageType },
    });

    const existedMatch = await this.matchRepository.findOne({
      where: {
        host: { id: hostId },
        guest: { id: guestId },
        stage: { id: stage.id },
      },
    });

    const forceWinner = forceWinnerId
      ? await this.participantRepository.findOne({
          where: { id: forceWinnerId },
        })
      : null;

    const hostScoreValue = isNotEmpty(hostScore) ? hostScore : null;
    const guestScoreValue = isNotEmpty(guestScore) ? guestScore : null;
    const hostPenValue = isNotEmpty(hostPen) ? hostPen : null;
    const guestPenValue = isNotEmpty(guestPen) ? guestPen : null;

    if (existedMatch) {
      if (existedMatch.answer === answer) {
        existedMatch.date = date || null;
        existedMatch.replayDate = replayDate || null;
        existedMatch.hostScore = answer ? guestScoreValue : hostScoreValue;
        existedMatch.guestScore = answer ? hostScoreValue : guestScoreValue;
        existedMatch.hostPen = answer ? guestPenValue : hostPenValue;
        existedMatch.guestPen = answer ? hostPenValue : guestPenValue;
        existedMatch.forceWinner = forceWinner;
        existedMatch.unplayed = unplayed;
        existedMatch.tech = tech;

        existedMatch.deductedPointsList = deductions.map(
          ({ participantId, points }) => {
            const item = new DeductedPoints();

            item.points = points;
            item.participant = { id: participantId } as Participant;

            return item;
          }
        );

        return await this.matchRepository.save(existedMatch);
      }
    }

    const match = new Match();

    match.stage = stage;
    match.date = date || null;
    match.replayDate = replayDate || null;
    match.answer = answer;
    match.host = answer ? guest : host;
    match.guest = answer ? host : guest;
    match.hostScore = answer ? guestScoreValue : hostScoreValue;
    match.guestScore = answer ? hostScoreValue : guestScoreValue;
    match.hostPen = answer ? guestPenValue : hostPenValue;
    match.guestPen = answer ? hostPenValue : guestPenValue;
    match.tour = tour;
    match.group = group;
    match.forceWinner = forceWinner;
    match.unplayed = unplayed;
    match.tech = tech;

    match.deductedPointsList = deductions.map(({ participantId, points }) => {
      const item = new DeductedPoints();

      item.points = points;
      item.participant = { id: participantId } as Participant;

      return item;
    });

    return await this.matchRepository.save(match);
  }

  public async updateMatchResult(
    matchId: number,
    {
      hostScore,
      hostPen,
      guestScore,
      guestPen,
      answer,
      replayDate,
      forceWinnerId,
      unplayed,
      tech,
      date,
      deductions = [],
    }: MatchResultDto
  ) {
    const match = await this.matchRepository.findOne({
      relations: { host: true, guest: true, deductedPointsList: true },
      where: { id: matchId },
    });

    const forceWinner = forceWinnerId
      ? await this.participantRepository.findOne({
          where: { id: forceWinnerId },
        })
      : null;

    if (answer) {
      const answerMatch = await this.matchRepository.findOne({
        where: {
          host: { id: match.guest.id },
          guest: { id: match.host.id },
        },
        relations: { host: true, guest: true, deductedPointsList: true },
      });

      answerMatch.date = date;
      answerMatch.hostScore = guestScore;
      answerMatch.guestScore = hostScore;
      answerMatch.replayDate = replayDate || null;
      answerMatch.hostPen = guestPen ?? null;
      answerMatch.guestPen = hostPen ?? null;
      answerMatch.forceWinner = forceWinner;
      answerMatch.unplayed = unplayed;
      answerMatch.tech = tech;

      answerMatch.deductedPointsList = deductions.map(
        ({ participantId, points }) => {
          const item = new DeductedPoints();

          item.participant = { id: participantId } as Participant;
          item.points = points;

          return item;
        }
      );

      return await this.matchRepository.save(answerMatch);
    } else {
      match.hostScore = hostScore;
      match.guestScore = guestScore;
      match.unplayed = unplayed;
      match.tech = tech;
      match.date = date;

      if (unplayed) {
        match.forceWinner = forceWinner;
      }

      match.deductedPointsList = deductions.map(({ participantId, points }) => {
        const item = new DeductedPoints();

        item.participant = { id: participantId } as Participant;
        item.points = points;

        return item;
      });

      return await this.matchRepository.save(match);
    }
  }

  public async removeMatch(id: number, { answerMatchId }: DeleteMatchDto) {
    if (isNotEmpty(answerMatchId)) {
      const answerMatch = await this.matchRepository.findOne({
        where: { id: answerMatchId },
      });

      await this.matchRepository.remove(answerMatch);
    }

    const match = await this.matchRepository.findOne({
      where: { id },
    });

    return await this.matchRepository.remove(match);
  }

  public async removeMatchResults(
    id: number,
    { answerMatchId }: DeleteMatchDto
  ) {
    if (isNotEmpty(answerMatchId)) {
      const answerMatch = await this.matchRepository.findOne({
        where: { id: answerMatchId },
      });

      await this.matchRepository.remove(answerMatch);
    }

    const match = await this.matchRepository.findOne({
      where: { id },
    });

    match.hostScore = null;
    match.guestScore = null;
    match.hostPen = null;
    match.guestPen = null;
    match.date = null;
    match.replayDate = null;
    match.forceWinner = null;
    match.unplayed = false;

    return await this.matchRepository.save(match);
  }

  public async getTwoCountriesMatches(countryId: number, rivalId: number) {
    const matchesQueryConfig: FindManyOptions<Match> = {
      relations: {
        host: {
          club: { city: { country: true, oldNames: true }, oldNames: true },
        },
        guest: {
          club: { city: { country: true, oldNames: true }, oldNames: true },
        },
        stage: { tournamentSeason: true, stageScheme: true },
      },
    };

    const matchesCR = await this.matchRepository.find({
      ...matchesQueryConfig,
      where: {
        host: { club: { city: { country: { id: countryId } } } },
        guest: { club: { city: { country: { id: rivalId } } } },
      },
    });

    const matchesRC = await this.matchRepository.find({
      ...matchesQueryConfig,
      where: {
        host: { club: { city: { country: { id: rivalId } } } },
        guest: { club: { city: { country: { id: countryId } } } },
      },
    });

    return matchesCR.concat(matchesRC).sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();

      return aDate - bDate;
    });
  }
}

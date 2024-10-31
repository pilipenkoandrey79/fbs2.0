import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  AvailableTournament,
  AvailableTournaments,
  StageType,
  StageUpdateDto,
  Tournament,
  TournamentSummary,
} from "@fbs2.0/types";

import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { Stage } from "../match/entities/stage.entity";
import { getSecuencedStagesList } from "../shared/utils";
import { StageDto } from "./entities/stage.dto";
import { StageScheme } from "../match/entities/stage-scheme.entity";
import { Match } from "../match/entities/match.entity";
import { StageSubstitution } from "./entities/stage-substitution.entity";
import { StageSubstitutionDto } from "./entities/stage-substitution.dto";
import { Participant } from "../participant/entities/participant.entity";
import { getWinners } from "@fbs2.0/utils";

@Injectable()
export class TournamentService {
  @InjectRepository(TournamentSeason)
  private readonly tournamentSeasonRepository: Repository<TournamentSeason>;

  @InjectRepository(Stage)
  private readonly stageRepository: Repository<Stage>;

  @InjectRepository(StageScheme)
  private readonly stageSchemeRepository: Repository<StageScheme>;

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;

  @InjectRepository(StageSubstitution)
  private readonly stageSubstitutionRepository: Repository<StageSubstitution>;

  @InjectRepository(Participant)
  private readonly participantRepository: Repository<Participant>;

  public async getAvailableTournaments(simplified?: boolean) {
    const rawTournamentSeasons = await this.tournamentSeasonRepository.find();

    const tournamentSeasons = await Promise.all(
      rawTournamentSeasons.map(async (tournamentSeason) => {
        const { season, tournament, id } = tournamentSeason;

        const linkedStages = await this.stageRepository.find({
          where: { tournamentSeason: { season }, linkedTournament: tournament },
        });

        if (simplified) {
          return {
            id,
            season,
            type: tournament,
            hasLinkedTournaments: linkedStages.length > 0,
          } as AvailableTournament;
        }

        const matches = await this.matchRepository.find({
          where: { stage: { tournamentSeason: { season, tournament } } },
        });

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
              tournamentSeason: { season, tournament },
            },
          },
          order: { date: "ASC" },
        });

        const { winner, finalist } = { ...getWinners(finalMatches)?.[0] };

        return {
          id,
          season,
          type: tournament,
          hasLinkedTournaments: linkedStages.length > 0,
          hasMatches: matches.length > 0,
          winner,
          finalist,
        } as AvailableTournament;
      })
    );

    return tournamentSeasons.reduce<AvailableTournaments>(
      (acc, { season, ...tournamentSeason }) => {
        if (acc[season]) {
          if (Array.isArray(acc[season])) {
            if (!acc[season].find((item) => item.id === tournamentSeason.id)) {
              acc[season].push(tournamentSeason);
            }
          }
        } else {
          acc[season] = [tournamentSeason];
        }

        return acc;
      },
      {}
    );
  }

  public async getSeasonSummary(season: string) {
    const rawTournamentSeasons = await this.tournamentSeasonRepository.find({
      where: { season },
    });

    return await Promise.all(
      rawTournamentSeasons.map(async (tournamentSeason) => {
        const { season, tournament, id } = tournamentSeason;

        const matches = await this.matchRepository.find({
          where: { stage: { tournamentSeason: { season, tournament } } },
        });

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
              tournamentSeason: { season, tournament },
            },
          },
          order: { date: "ASC" },
        });

        const { winner, finalist } = { ...getWinners(finalMatches)?.[0] };

        return {
          id,
          type: tournament,
          hasMatches: matches.length > 0,
          winner,
          finalist,
        } as TournamentSummary;
      })
    );
  }

  public async getStages(season: string, tournament: Tournament) {
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

    return await Promise.all(
      getSecuencedStagesList(stages).map(async (stage) => {
        const matchesCount = await this.matchRepository.count({
          where: { stage: { id: stage.id } },
        });

        return { ...stage, matchesCount };
      })
    );
  }

  private async createStage(
    stageDto: StageDto,
    tournamentSeason: TournamentSeason
  ) {
    const stage = new Stage();

    stage.tournamentSeason = tournamentSeason;
    stage.stageType = stageDto.stageType;

    let stageScheme = await this.stageSchemeRepository.findOne({
      where: {
        type: stageDto.stageSchemeType,
        isStarting: !!stageDto.isStarting,
        pen: !!stageDto.pen,
        awayGoal: !!stageDto.awayGoal,
        groups: stageDto.groups ?? null,
        swissNum: stageDto.swissNum ?? null,
      },
    });

    if (!stageScheme) {
      const newStageScheme = await this.stageSchemeRepository.save({
        type: stageDto.stageSchemeType,
        isStarting: stageDto.isStarting,
        groups: stageDto.groups ?? null,
        swissNum: stageDto.swissNum ?? null,
        pen: !!stageDto.pen,
        awayGoal: !!stageDto.awayGoal,
      } as StageScheme);

      stageScheme = newStageScheme;
    }

    stage.stageScheme = stageScheme;
    stage.linkedTournament = stageDto.linkedTournament || null;
    stage.linkedTournamentStage = stageDto.linkedStage || null;

    await this.stageRepository.save(stage);
  }

  public async createTournament(
    season: string,
    tournament: Tournament,
    stages: StageDto[]
  ) {
    const tournamentSeason = await this.tournamentSeasonRepository.save({
      tournament,
      season,
    } as TournamentSeason);

    await Promise.all(
      stages.map(async (stageDto) =>
        this.createStage(stageDto, tournamentSeason)
      )
    );

    await Promise.all(
      stages.map(async (stageDto) => {
        if (!stageDto.previousStageType) {
          return Promise.resolve();
        }

        const stage = await this.stageRepository.findOne({
          where: { tournamentSeason, stageType: stageDto.stageType },
        });

        const previousStage = await this.stageRepository.findOne({
          where: { tournamentSeason, stageType: stageDto.previousStageType },
        });

        stage.previousStage = previousStage;

        await this.stageRepository.save(stage);
      })
    );

    return tournamentSeason;
  }

  public async removeTournament(id: number) {
    const item = await this.tournamentSeasonRepository.findOne({
      where: { id },
    });

    return this.tournamentSeasonRepository.remove(item);
  }

  public async createStageSubstitution(dto: StageSubstitutionDto) {
    const expelled = await this.participantRepository.findOne({
      where: { id: dto.expelledId },
    });

    const sub = await this.participantRepository.findOne({
      where: { id: dto.subId },
    });

    const stage = await this.stageRepository.findOne({
      where: { id: dto.stageId },
    });

    const stageSubstitution = new StageSubstitution();

    stageSubstitution.expelled = expelled;
    stageSubstitution.stage = stage;
    stageSubstitution.sub = sub;

    return await this.stageSubstitutionRepository.save(stageSubstitution);
  }

  public async updateStage(id: number, stageUpdateDto: StageUpdateDto) {
    const stage = await this.stageRepository.findOne({
      relations: { stageScheme: true },
      where: { id },
    });

    let stageScheme = await this.stageSchemeRepository.findOne({
      where: {
        type: stage.stageScheme.type,
        isStarting: !!stageUpdateDto.isStarting,
        pen: !!stageUpdateDto.pen,
        awayGoal: !!stageUpdateDto.awayGoal,
        groups: stageUpdateDto.groups ?? null,
        swissNum: stageUpdateDto.swissNum ?? null,
      },
    });

    if (!stageScheme) {
      const newStageScheme = await this.stageSchemeRepository.save({
        type: stage.stageScheme.type,
        isStarting: stageUpdateDto.isStarting,
        groups: stageUpdateDto.groups ?? null,
        swissNum: stageUpdateDto.swissNum ?? null,
        pen: !!stageUpdateDto.pen,
        awayGoal: !!stageUpdateDto.awayGoal,
      } as StageScheme);

      stageScheme = newStageScheme;
    }

    stage.stageScheme = stageScheme;

    return await this.stageRepository.save(stage);
  }

  public async removeStage(id: number) {
    const item = await this.stageRepository.findOne({
      where: { id },
    });

    return this.stageRepository.remove(item);
  }

  public async appendStage(
    season: string,
    tournament: Tournament,
    stageDto: StageDto
  ) {
    const tournamentSeason = await this.tournamentSeasonRepository.findOne({
      where: { season, tournament },
    });

    await this.createStage(stageDto, tournamentSeason);

    const stage = await this.stageRepository.findOne({
      where: { tournamentSeason, stageType: stageDto.stageType },
    });

    const previousStage = await this.stageRepository.findOne({
      where: { tournamentSeason, stageType: stageDto.previousStageType },
    });

    stage.previousStage = previousStage;

    return await this.stageRepository.save(stage);
  }
}

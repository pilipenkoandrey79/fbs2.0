import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { TournamentController } from "./tournament.controller";
import { TournamentService } from "./tournament.service";
import { Stage } from "../match/entities/stage.entity";
import { StageScheme } from "../match/entities/stage-scheme.entity";
import { Match } from "../match/entities/match.entity";
import { StageSubstitution } from "./entities/stage-substitution.entity";
import { Participant } from "../participant/entities/participant.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TournamentSeason,
      Stage,
      StageScheme,
      Match,
      StageSubstitution,
      Participant,
    ]),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}

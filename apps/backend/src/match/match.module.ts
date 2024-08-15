import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./entities/match.entity";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";
import { Stage } from "./entities/stage.entity";
import { Participant } from "../participant/entities/participant.entity";
import { StageScheme } from "./entities/stage-scheme.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match,
      Stage,
      StageScheme,
      Participant,
      TournamentSeason,
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}

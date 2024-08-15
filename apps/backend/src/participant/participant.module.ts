import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Participant } from "./entities/participant.entity";
import { ParticipantController } from "./participant.controller";
import { ParticipantService } from "./participant.service";
import { Club } from "../club/entities/club.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { Match } from "../match/entities/match.entity";
import { Stage } from "../match/entities/stage.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      Club,
      TournamentSeason,
      Match,
      Stage,
    ]),
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService],
})
export class ParticipantModule {}

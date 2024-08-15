import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Club } from "./entities/club.entity";
import { ClubController } from "./club.controller";
import { ClubService } from "./club.service";
import { City } from "../city/entities/city.entity";
import { OldClubName } from "./entities/old-club-name.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Match } from "../match/entities/match.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, OldClubName, City, Participant, Match]),
  ],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule {}

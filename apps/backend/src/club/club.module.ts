import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Club } from "./entities/club.entity";
import { _ClubController } from "./_club.controller";
import { ClubService } from "./club.service";
import { City } from "../city/entities/city.entity";
import { OldClubName } from "./entities/old-club-name.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Match } from "../match/entities/match.entity";
import { Country } from "../country/entities/country.entity";
import { ClubController } from "./club.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      OldClubName,
      City,
      Country,
      Participant,
      Match,
    ]),
  ],
  controllers: [_ClubController, ClubController],
  providers: [ClubService],
})
export class ClubModule {}

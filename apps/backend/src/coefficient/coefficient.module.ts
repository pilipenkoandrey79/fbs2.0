import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClubCoefficient } from "./entities/club-coefficient.entity";
import { CoefficientController } from "./coefficient.controller";
import { CoefficientService } from "./coefficient.service";
import { Participant } from "../participant/entities/participant.entity";
import { Match } from "../match/entities/match.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { Country } from "../country/entities/country.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClubCoefficient,
      Participant,
      Match,
      TournamentSeason,
      Country,
    ]),
  ],
  controllers: [CoefficientController],
  providers: [CoefficientService],
})
export class CoefficientModule {}

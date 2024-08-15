import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Country } from "./entities/country.entity";
import { OldCityName } from "../city/entities/old-city-name.entity";
import { Match } from "../match/entities/match.entity";
import { CountryController } from "./country.controller";
import { CountryService } from "./country.service";

@Module({
  imports: [TypeOrmModule.forFeature([Country, OldCityName, Match])],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}

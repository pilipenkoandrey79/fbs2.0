import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { City } from "./entities/city.entity";
import { OldCityName } from "./entities/old-city-name.entity";
import { Country } from "../country/entities/country.entity";
import { CityController } from "./city.controller";
import { CityService } from "./city.service";

@Module({
  imports: [TypeOrmModule.forFeature([Country, City, OldCityName])],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}

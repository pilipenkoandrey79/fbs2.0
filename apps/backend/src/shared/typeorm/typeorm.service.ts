import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { Club } from "../../club/entities/club.entity";
import { City } from "../../city/entities/city.entity";
import { Country } from "../../country/entities/country.entity";
import { Stage } from "../../match/entities/stage.entity";
import { Match } from "../../match/entities/match.entity";
import { Participant } from "../../participant/entities/participant.entity";
import { TournamentSeason } from "../entities/tournament-season.entity";
import { StageScheme } from "../../match/entities/stage-scheme.entity";
import { OldClubName } from "../../club/entities/old-club-name.entity";
import { OldCityName } from "../../city/entities/old-city-name.entity";
import { DeductedPoints } from "../../match/entities/deducted-points.entity";
import { StageSubstitution } from "../../tournament/entities/stage-substitution.entity";
import { User } from "../../user/user.entity";
import { ClubCoefficient } from "../../coefficient/entities/club-coefficient.entity";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.config.get<string>("DATABASE_HOST"),
      port: this.config.get<number>("DATABASE_PORT"),
      database: this.config.get<string>("DATABASE_NAME"),
      username: this.config.get<string>("DATABASE_USER"),
      password: this.config.get<string>("DATABASE_PASSWORD"),
      entities: [
        City,
        OldCityName,
        Country,
        Club,
        OldClubName,
        Participant,
        TournamentSeason,
        Stage,
        StageScheme,
        Match,
        DeductedPoints,
        StageSubstitution,
        User,
        ClubCoefficient,
      ],
      logger: "file",
      synchronize: this.config.get<boolean>("DATABASE_SYNC"),
    };
  }
}

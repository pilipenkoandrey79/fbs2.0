import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TypeOrmConfigService } from "./shared/typeorm/typeorm.service";
import { ClubModule } from "./club/club.module";
import { MatchModule } from "./match/match.module";
import { TournamentModule } from "./tournament/tournament.module";
import { ParticipantModule } from "./participant/participant.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { CoefficientModule } from "./coefficient/coefficient.module";
import { CityModule } from "./city/city.module";
import { CountryModule } from "./country/country.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    CityModule,
    CountryModule,
    ClubModule,
    ParticipantModule,
    MatchModule,
    TournamentModule,
    UserModule,
    CoefficientModule,
  ],
})
export class AppModule {}

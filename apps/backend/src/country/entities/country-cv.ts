import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CountryCV as CountryCVInterface,
  CountryCVStatus,
} from "@fbs2.0/types";

import { TournamentSeason } from "../../shared/entities/tournament-season.entity";
import { Participant } from "../../participant/entities/participant.entity";

class ClubWithWinner extends Participant {
  @ApiPropertyOptional({ type: "boolean" })
  isWinner?: boolean;
}

export class CountryCV implements CountryCVInterface {
  @ApiProperty({ type: () => TournamentSeason })
  tournamentSeason: TournamentSeason;

  @ApiProperty({ type: () => ClubWithWinner })
  host: ClubWithWinner;

  @ApiProperty({ type: () => ClubWithWinner })
  guest: ClubWithWinner;

  @ApiProperty({ enum: CountryCVStatus })
  status: CountryCVStatus;
}

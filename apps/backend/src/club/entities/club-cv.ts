import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  Balance as BalanceInterface,
  ClubCV as ClubCVInterface,
  StageType,
} from "@fbs2.0/types";

import { TournamentSeason } from "../../shared/entities/tournament-season.entity";

class Balance implements BalanceInterface {
  @ApiProperty({ type: "number" })
  w: number;

  @ApiProperty({ type: "number" })
  d: number;

  @ApiProperty({ type: "number" })
  l: number;

  @ApiProperty({ type: "number" })
  u: number;
}

export class ClubCV implements ClubCVInterface {
  @ApiProperty({ enum: StageType })
  start: StageType;

  @ApiProperty({ enum: StageType })
  finish: StageType;

  @ApiPropertyOptional({ type: "boolean" })
  isWinner?: boolean;

  @ApiProperty({ type: () => Balance })
  balance: Balance;

  @ApiProperty({ type: () => TournamentSeason })
  tournamentSeason: TournamentSeason;
}

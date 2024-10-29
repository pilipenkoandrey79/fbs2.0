import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AvailableTournament as AvailableTournamentInterface } from "@fbs2.0/types";

import { TournamentSummary } from "./tournament-summary";

export class AvailableTournament
  extends TournamentSummary
  implements AvailableTournamentInterface
{
  @ApiPropertyOptional({ type: "string" })
  season?: string;

  @ApiProperty({ type: "boolean" })
  hasLinkedTournaments: boolean;
}

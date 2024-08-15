import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AvailableTournament as AvailableTournamentInterface,
  Tournament,
} from "@fbs2.0/types";

import { Participant } from "../../participant/entities/participant.entity";

export class AvailableTournament implements AvailableTournamentInterface {
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty({ enum: Tournament })
  type: Tournament;

  @ApiPropertyOptional({ type: "string" })
  season?: string;

  @ApiProperty({ type: "boolean" })
  hasLinkedTournaments: boolean;

  @ApiProperty({ type: "boolean" })
  hasMatches: boolean;

  @ApiProperty({ type: () => Participant })
  winner: Participant;

  @ApiProperty({ type: () => Participant })
  finalist: Participant;
}

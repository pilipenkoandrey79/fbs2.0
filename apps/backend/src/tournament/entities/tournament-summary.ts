import { ApiProperty } from "@nestjs/swagger";
import {
  Tournament,
  TournamentSummary as TournamentSummaryInterface,
} from "@fbs2.0/types";

import { Participant } from "../../participant/entities/participant.entity";

export class TournamentSummary implements TournamentSummaryInterface {
  @ApiProperty({ type: "number" })
  id: number;

  @ApiProperty({ enum: Tournament })
  type: Tournament;

  @ApiProperty({ type: "boolean" })
  hasMatches: boolean;

  @ApiProperty({ type: () => Participant })
  winner: Participant;

  @ApiProperty({ type: () => Participant })
  finalist: Participant;
}

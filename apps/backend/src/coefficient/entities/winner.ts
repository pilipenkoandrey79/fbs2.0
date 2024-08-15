import { ApiProperty } from "@nestjs/swagger";
import { Winner as WinnerInterface } from "@fbs2.0/types";

import { TournamentSeason } from "../../shared/entities/tournament-season.entity";
import { Participant } from "../../participant/entities/participant.entity";

export class Winner implements WinnerInterface {
  @ApiProperty({ type: () => TournamentSeason })
  tournament: TournamentSeason;

  @ApiProperty({ type: () => Participant })
  winner: Participant;

  @ApiProperty({ type: () => Participant })
  finalist: Participant;
}

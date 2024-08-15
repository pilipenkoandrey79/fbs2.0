import { TournamentPart as TournamentPartInterface } from "@fbs2.0/types";
import { ApiProperty } from "@nestjs/swagger";

import { Stage } from "./stage.entity";
import { BaseMatch } from "./match.entity";

export class TournamentPart implements TournamentPartInterface {
  @ApiProperty({ type: () => Stage })
  stage: Stage;

  @ApiProperty({ type: () => [BaseMatch] })
  matches: BaseMatch[];
}

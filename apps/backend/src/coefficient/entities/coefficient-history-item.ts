import { ApiProperty } from "@nestjs/swagger";
import { CoefficientHistoryItem as CoefficientHistoryItemInterface } from "@fbs2.0/types";

export class CoefficientHistoryItem implements CoefficientHistoryItemInterface {
  @ApiProperty({ type: "string" })
  season: string;

  @ApiProperty({ type: "number" })
  place: number;

  @ApiProperty({ type: "number" })
  places: number;

  @ApiProperty({ type: "number" })
  rank: number;

  @ApiProperty({ type: "number" })
  totalCoefficient: number;
}

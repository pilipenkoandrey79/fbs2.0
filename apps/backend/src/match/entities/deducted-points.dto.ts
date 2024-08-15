import { ApiProperty } from "@nestjs/swagger";
import { DeductedPointsDto as DeductedPointsDtoInterface } from "@fbs2.0/types";

export class DeductedPointsDto implements DeductedPointsDtoInterface {
  @ApiProperty({ type: "number" })
  participantId: number;

  @ApiProperty({ type: "number" })
  points: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { StageSubstitutionDto as StageSubstitutionDtoInterface } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber } from "class-validator";

export class StageSubstitutionDto implements StageSubstitutionDtoInterface {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: "number" })
  stageId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: "number" })
  expelledId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: "number" })
  subId: number;
}

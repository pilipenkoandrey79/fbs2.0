import { ApiProperty } from "@nestjs/swagger";
import { ParticipantDto, StageType } from "@fbs2.0/types";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class CreateParticipantDto implements ParticipantDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  clubId: number;

  @IsNotEmpty()
  @IsEnum(StageType)
  @ApiProperty({ enum: StageType })
  startingStage: StageType;
}

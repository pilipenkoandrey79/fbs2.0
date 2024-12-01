import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  StageDto as StageDtoInterface,
  StageSchemeType,
  StageType,
  Tournament,
} from "@fbs2.0/types";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";

export class StageDto implements StageDtoInterface {
  @IsNotEmpty()
  @IsEnum(StageType)
  @ApiProperty({ enum: StageType })
  stageType: StageType;

  @IsNotEmpty()
  @IsEnum(StageSchemeType)
  @ApiProperty({ enum: StageSchemeType })
  stageSchemeType: StageSchemeType;

  @IsBoolean()
  @ApiProperty({ type: "boolean" })
  isStarting: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: "boolean" })
  pen?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: "boolean" })
  awayGoal?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  groups?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  swissNum?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  swissTours?: number;

  @IsOptional()
  @IsEnum(Tournament)
  @ApiPropertyOptional({ enum: Tournament })
  linkedTournament?: Tournament;

  @IsOptional()
  @IsEnum(StageType)
  @ApiPropertyOptional({ enum: StageType })
  linkedStage?: StageType;

  @IsOptional()
  @IsEnum(StageType)
  @ApiPropertyOptional({ enum: StageType })
  previousStageType?: StageType;
}

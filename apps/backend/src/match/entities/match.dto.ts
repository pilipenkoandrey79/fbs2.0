import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Group, MatchDto, StageType } from "@fbs2.0/types";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

import { DeductedPointsDto } from "./deducted-points.dto";

export class CreateMatchDto implements MatchDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  public hostId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  public guestId: number;

  @IsNotEmpty()
  @IsEnum(StageType)
  @ApiProperty({ enum: StageType })
  stageType: StageType;

  @IsOptional()
  @IsDateString({ strict: false, strictSeparator: false })
  @ApiPropertyOptional({ type: "string" })
  date?: string;

  @IsOptional()
  @IsDateString({ strict: false, strictSeparator: false })
  @ApiPropertyOptional({ type: "string" })
  replayDate?: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: "boolean" })
  answer: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  hostScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  guestScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  hostPen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ type: "number" })
  guestPen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(8)
  @ApiPropertyOptional({ type: "number" })
  tour?: number;

  @IsOptional()
  @IsEnum(Group)
  @ApiProperty({ enum: Group })
  group?: Group;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: "number" })
  public forceWinnerId?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: "boolean" })
  unplayed?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: "boolean" })
  tech?: boolean;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: () => [DeductedPointsDto] })
  deductions?: DeductedPointsDto[];
}

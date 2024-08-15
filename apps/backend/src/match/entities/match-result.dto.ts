import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MatchResultDto } from "@fbs2.0/types";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";

import { DeductedPointsDto } from "./deducted-points.dto";

export class UpdateMatchResultDto implements MatchResultDto {
  @IsOptional()
  @IsDateString({ strict: false, strictSeparator: false })
  @ApiPropertyOptional({ type: "string" })
  date?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: "boolean" })
  answer?: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ type: "number" })
  hostScore: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ type: "number" })
  guestScore: number;

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

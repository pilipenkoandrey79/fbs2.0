import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OldCityNameDto } from "@fbs2.0/types";
import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateOldCityNameDTO implements OldCityNameDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: "number" })
  public id: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public name_ua: string;

  @IsString()
  @ApiProperty({ type: "string" })
  public till: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ type: "number" })
  public countryId: number;
}

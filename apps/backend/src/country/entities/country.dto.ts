import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Country } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCountryDto implements Country {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: "number" })
  public id: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public code: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public from: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: "string" })
  public till: string;
}

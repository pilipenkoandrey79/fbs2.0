import { ApiProperty } from "@nestjs/swagger";
import {
  CityDto as CityDtoInterface,
  NAME_FIELD_LENGTH,
  OldCityNameDto,
} from "@fbs2.0/types";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CityDto implements CityDtoInterface {
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_FIELD_LENGTH)
  @ApiProperty({ type: "string" })
  public name: string;

  @IsString()
  @MaxLength(NAME_FIELD_LENGTH)
  @ApiProperty({ type: "string" })
  public name_ua: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  public countryId: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: "array" })
  public oldNames?: OldCityNameDto[];
}

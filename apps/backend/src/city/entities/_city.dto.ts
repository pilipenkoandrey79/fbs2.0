import { ApiProperty } from "@nestjs/swagger";
import { _CityDto, NAME_FIELD_LENGTH } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class _CreateCityDto implements _CityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_FIELD_LENGTH)
  @ApiProperty({ type: "string" })
  public name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  public countryId: number;
}

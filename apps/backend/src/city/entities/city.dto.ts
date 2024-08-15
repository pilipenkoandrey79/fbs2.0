import { ApiProperty } from "@nestjs/swagger";
import { CityDto } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateCityDto implements CityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @ApiProperty({ type: "string" })
  public name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  public countryId: number;
}

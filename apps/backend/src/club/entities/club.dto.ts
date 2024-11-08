import { ApiProperty } from "@nestjs/swagger";
import {
  ClubDto as ClubDtoInterface,
  NAME_FIELD_LENGTH,
  OldClubNameDto,
} from "@fbs2.0/types";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class ClubDto implements ClubDtoInterface {
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
  public cityId: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: "array" })
  public oldNames?: OldClubNameDto[];
}

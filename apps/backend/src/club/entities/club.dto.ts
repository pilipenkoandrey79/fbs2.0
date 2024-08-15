import { ApiProperty } from "@nestjs/swagger";
import { ClubDto } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateClubDto implements ClubDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: "string" })
  public name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  cityId: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { _OldClubNameDto as _OldClubNameDtoInterface } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class _OldClubNameDto implements _OldClubNameDtoInterface {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: "string" })
  till: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: "string" })
  public name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: "number" })
  clubId: number;
}

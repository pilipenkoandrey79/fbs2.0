import { ApiProperty } from "@nestjs/swagger";
import { OldClubNameDto as OldClubNameDtoInterface } from "@fbs2.0/types";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OldClubNameDto implements OldClubNameDtoInterface {
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

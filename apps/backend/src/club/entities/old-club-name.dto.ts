import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OldClubNameDto as OldClubNameDtoInterface } from "@fbs2.0/types";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class OldClubNameDto implements OldClubNameDtoInterface {
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
  public clubId: number;
}

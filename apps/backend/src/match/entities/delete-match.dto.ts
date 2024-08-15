import { ApiPropertyOptional } from "@nestjs/swagger";
import { DeleteMatchDto as DeleteMatchDtoInterface } from "@fbs2.0/types";
import { IsNumber, IsOptional } from "class-validator";

export class DeleteMatchDto implements DeleteMatchDtoInterface {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ type: "number" })
  answerMatchId?: number;
}

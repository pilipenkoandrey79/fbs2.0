import { ApiProperty } from "@nestjs/swagger";
import { JWTTokensPair } from "@fbs2.0/types";

export class TokensPairResponse implements JWTTokensPair {
  @ApiProperty({ type: "string" })
  accessToken: string;

  @ApiProperty({ type: "string" })
  refreshToken: string;
}

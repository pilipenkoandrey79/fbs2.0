import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_REDIRECT_PATH, ApiEntities } from "@fbs2.0/types";
import { ConfigService } from "@nestjs/config";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { TokensPairResponse } from "./tokens-pair.class";

@Controller(ApiEntities.Auth)
@ApiTags(ApiEntities.Auth)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    protected configService: ConfigService
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() request) {
    return request;
  }

  @Get("redirect")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() request, @Res() response) {
    const { accessToken, refreshToken } = await this.authService.login(
      request.user
    );

    const feUrl = this.configService.get<string>("FRONTEND_URL");
    const urlSegments = [feUrl, AUTH_REDIRECT_PATH, accessToken, refreshToken];

    response.redirect(urlSegments.join("/"));

    return true;
  }

  @Get("refresh")
  @UseGuards(RefreshTokenGuard)
  @ApiResponse({ type: TokensPairResponse })
  refreshTokens(@Req() request): Promise<TokensPairResponse> {
    const id = request.user.id;
    const refreshToken = request.user.refreshToken;

    return this.authService.refreshTokens(id, refreshToken);
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request as ExpressReq } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "@fbs2.0/types";

import { UsersService } from "../../user/user.servise";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(
    protected configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      usernameField: "email",
      passReqToCallback: true,
    });
  }

  async validate(req: ExpressReq, payload: JwtPayload) {
    const refreshToken = req.get("Authorization").replace("Bearer", "").trim();

    if (payload.sub) {
      const user = await this.usersService.findOneById(payload.sub);

      return { ...user, refreshToken };
    }

    return { id: payload.sub, email: payload.email, refreshToken };
  }
}

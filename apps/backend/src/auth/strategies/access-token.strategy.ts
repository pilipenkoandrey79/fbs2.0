import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "@fbs2.0/types";

import { UsersService } from "../../user/user.servise";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    protected configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET"),
      usernameField: "email",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.sub) {
      return await this.usersService.findOneById(payload.sub);
    }

    return { id: payload.sub, email: payload.email };
  }
}

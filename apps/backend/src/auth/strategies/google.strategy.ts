import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy } from "passport-google-oauth2";

import { AuthService } from "../auth.service";

export interface IGoogleUser {
  email: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    protected configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get<string>("AUTH_GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("AUTH_GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get<string>("AUTH_GOOGLE_CALLBACK_URL"),
      scope: ["profile", "email"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails } = profile;

    const googleUser: IGoogleUser = {
      email: emails[0].value,
      accessToken,
      refreshToken,
    };

    const user = await this.authService.googleUserValidate(googleUser);

    return { ...googleUser, ...user };
  }
}

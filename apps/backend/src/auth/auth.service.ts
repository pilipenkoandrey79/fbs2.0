import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JWTTokensPair } from "@fbs2.0/types";
import { ConfigService } from "@nestjs/config";

import { IGoogleUser } from "./strategies/google.strategy";
import { User } from "../user/user.entity";
import { UsersService } from "../user/user.servise";
import { hashData, validateHashedData } from "../shared/utils";

@Injectable()
export class AuthService {
  constructor(
    protected configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async googleUserValidate(googleUser: IGoogleUser): Promise<Partial<User>> {
    const [user] = await this.usersService.findByEmail(googleUser.email);

    if (user) {
      return user;
    } else {
      return await this.usersService.createUserWithGoogle(googleUser);
    }
  }

  async login(user: Partial<User>): Promise<JWTTokensPair> {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await hashData(refreshToken);

    await this.usersService.update(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(id: number, email: string): Promise<JWTTokensPair> {
    const payload = { email, sub: id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRATION_TIME"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: Number(
          this.configService.get<string>("NX_JWT_REFRESH_EXPIRATION_TIME")
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    id: number,
    refreshToken: string
  ): Promise<JWTTokensPair> {
    const user = await this.usersService.findOneById(id);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Access Denied");
    }

    const refreshTokenMatches = await validateHashedData(
      refreshToken,
      user.refreshToken
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException("Access Denied");
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}

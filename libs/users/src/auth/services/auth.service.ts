import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../users.service';
import { AccessTokenResponse, AccessToken } from '../auth.models';
import { ConfigService } from '@backend/config';
import { User } from '@backend/users/users.model';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService, private users: UsersService) {}

  public validateAccessToken = (token: string): AccessToken | false => {
    try {
      return jwt.verify(
        token,
        this.config.jwt.accessTokenSecret
      ) as AccessToken;
    } catch (err) {
      return false;
    }
  };

  public generateAccessToken = async (
    user: User,
    expirationOverride?: number
  ): Promise<AccessTokenResponse> => {
    const expiration =
      expirationOverride || this.config.jwt.accessTokenExpiration;
    const accessToken = jwt.sign(
      { user: user.serialize() },
      this.config.jwt.accessTokenSecret,
      {
        expiresIn: expiration,
      }
    );

    this.users.patch({ id: user._id, set: { lastLoginAt: new Date() } });

    return { expiration: Date.now() + expiration * 1000, token: accessToken };
  };
}

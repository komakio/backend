import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../users.service';
import { AccessTokenResponse, AccessToken } from '../auth.models';
import { ConfigService } from 'src/config/config.service';
import { User } from 'src/users/users.model';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService, private users: UsersService) {}

    public validateAccessToken = (token: string): AccessToken | false => {
        try {
            return jwt.verify(token, this.config.jwt.accessTokenSecret) as AccessToken;
        } catch (err) {
            return false;
        }
    };

    public async generateTokens(user: User): Promise<AccessTokenResponse> {
        const accessTokenInfo = await this.generateAccessToken(user);
        return {
            ...accessTokenInfo,
        };
    }

    public generateAccessToken = async (
        user: User,
        expirationOverride?: number,
    ): Promise<{
        accessToken: string;
        /** Timestamp of expiration in ms */
        expiration: number;
    }> => {
        const expiration = expirationOverride || this.config.jwt.accessTokenExpiration;
        const accessToken = jwt.sign({ user: user.serialize() }, this.config.jwt.accessTokenSecret, {
            expiresIn: expiration,
        });

        this.users.patch({ id: user._id, data: { lastLoginAt: new Date() } });

        return { expiration: Date.now() + expiration * 1000, accessToken };
    };
}

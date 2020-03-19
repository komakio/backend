import { Injectable } from '@nestjs/common';
import { User } from '@backend/users';
import { ConfigService } from '@config';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '@db/redis';
import { ObjectID } from 'bson';
import { UsersService } from '../../users.service';
import { AccessTokenResponse, RefreshTokenResponse, AccessToken, RefreshToken } from '../auth.models';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService, private redis: RedisService, private users: UsersService) {}

    public validateAccessToken = (token: string): AccessToken | false => {
        try {
            return jwt.verify(token, this.config.jwt.accessTokenSecret) as AccessToken;
        } catch (err) {
            return false;
        }
    };

    public async validateRefreshToken(token: string): Promise<RefreshToken | false> {
        try {
            const refreshToken = jwt.verify(token, this.config.jwt.refreshTokenSecret) as RefreshToken;
            const refreshTokenDate = await this.getRefreshTokenDate(refreshToken._id, token);
            if (!refreshTokenDate) {
                return false;
            }
            return refreshToken;
        } catch (err) {
            return false;
        }
    }

    public async generateTokens(user: User): Promise<AccessTokenResponse & RefreshTokenResponse> {
        const accessTokenInfo = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);
        return {
            ...accessTokenInfo,
            refreshToken,
        };
    }

    public async generateRefreshToken(user: User): Promise<RefreshTokenResponse['refreshToken']> {
        const refreshToken = jwt.sign({ _id: user._id }, this.config.jwt.refreshTokenSecret, {
            expiresIn: this.config.jwt.refreshTokenExpiration,
        });

        this.addRefreshTokenToRedis(user._id, refreshToken);

        return refreshToken;
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

        this.users.patch(user._id, { lastLoginDate: new Date() });

        return { expiration: Date.now() + expiration * 1000, accessToken };
    };

    private async addRefreshTokenToRedis(userId: ObjectID, token: string): Promise<void> {
        await this.redis.db.zadd(this.getRefreshTokenKey(userId), `${Date.now()}`, token);
    }

    private async getRefreshTokenDate(userId: ObjectID, token: string): Promise<string> {
        return this.redis.db.zscore(this.getRefreshTokenKey(userId), token);
    }

    private getRefreshTokenKey(userId: ObjectID): string {
        return `${this.redis.prefix}:${userId}:refreshTokens`;
    }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@config';
import * as jwt from 'jsonwebtoken';
import { ObjectID } from 'bson';

@Injectable()
export class ResetPasswordService {
    constructor(private config: ConfigService) {}

    public async generateForgotPasswordToken(userId: ObjectID, overrideExpire?: number): Promise<string> {
        return jwt.sign({ userId }, this.config.jwt.refreshTokenSecret, {
            expiresIn: overrideExpire || this.config.jwt.forgotPasswordExpiration,
        });
    }

    public async validateForgotPasswordToken(token: string): Promise<{ userId: ObjectID } | false> {
        try {
            return jwt.verify(token, this.config.jwt.refreshTokenSecret) as any;
        } catch (err) {
            return false;
        }
    }
}

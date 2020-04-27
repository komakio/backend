import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import Axios from 'axios';
import { LoggerService } from '@backend/logger';

@Injectable()
export class FacebookService {
  constructor(private config: ConfigService, private logger: LoggerService) {}

  public async getUserId(identityToken: string) {
    try {
      const { data } = await Axios.get(
        `https://graph.facebook.com/debug_token?input_token=${identityToken}&access_token=${this.config.facebook.appId}|${this.config.facebook.appSecret}`
      );
      return data?.data?.user_id;
    } catch (err) {
      this.logger.verbose({
        route: 'facebook-login',
        error: err?.message,
      });
    }
  }
}

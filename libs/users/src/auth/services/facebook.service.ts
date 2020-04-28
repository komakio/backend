import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import Axios from 'axios';
import { LoggerService } from '@backend/logger';

@Injectable()
export class FacebookService {
  constructor(private config: ConfigService, private logger: LoggerService) {}

  public async getUserId(fbAccessToken: string) {
    try {
      const { data } = await Axios.get(
        `https://graph.facebook.com/v6.0/debug_token?input_token=${fbAccessToken}&&access_token=${this.config.facebook.appId}|${this.config.facebook.appSecret}`
      );

      if (
        !data?.data.is_valid ||
        data?.data?.app_id !== this.config.facebook.appId
      ) {
        return;
      }
      return data?.data?.user_id;
    } catch (err) {
      this.logger.verbose({
        route: 'facebook-login',
        error: err?.message,
      });
    }
  }
}

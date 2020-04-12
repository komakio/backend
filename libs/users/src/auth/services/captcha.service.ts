import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import Axios from 'axios';
import { LoggerService } from '@backend/logger';
import { ExceptionsService } from '@backend/exceptions';
import qs from 'qs';
@Injectable()
export class RecaptchaService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private exceptions: ExceptionsService
  ) {}

  public async validate(response: string): Promise<boolean> {
    try {
      const res = await Axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        qs.stringify({ response, secret: this.config.recaptcha.secret }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { success, score, hostname } = res.data;

      if (
        !success ||
        !this.config.recaptchaAllowedHostnames.includes(hostname)
      ) {
        return;
      }

      return score > this.config.recaptcha.score;
    } catch (e) {
      this.logger.error({ route: 'google-recaptcha', error: e.message });
      this.exceptions.report(e);
    }
  }
}

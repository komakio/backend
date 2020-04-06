import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import Axios from 'axios';
import { LoggerService } from '@backend/logger';
import { ExceptionsService } from '@backend/exceptions';

@Injectable()
export class RecaptchaService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private exceptions: ExceptionsService
  ) {}

  public async validate(response: string): Promise<boolean> {
    const data = new FormData();
    data.append('secret', this.config.recaptcha.secret);
    data.append('response', response);

    try {
      const res = await Axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { success, score, host } = res.data;

      if (!success || this.config.host !== host) {
        return;
      }

      return score > 0.5;
    } catch (e) {
      this.logger.error({ route: 'google-recaptcha', error: e.message });
      this.exceptions.report(e);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { SentryService } from './sentry/sentry.service';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';

@Injectable()
export class ExceptionsService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private sentry: SentryService
  ) {}

  public report(err: Error, additionalInfo?: any) {
    if (!this.config.isProduction) {
      let context = '';
      try {
        context = JSON.stringify(additionalInfo);
      } catch {}
      this.logger.error(err.message, err.stack, context);
      return;
    }

    this.sentry.report(err, additionalInfo);
  }
}

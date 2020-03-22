import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@backend/config';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  public onModuleInit() {
    if (this.config.isProduction && this.config.sentryDsn) {
      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.env,
        release: this.config.tag && `backend@${this.config.tag}`,
      });
    }
  }

  public report(err: Error, additionalInfo?: any) {
    if (additionalInfo) {
      Sentry.withScope((scope: any) => {
        scope.setExtras(additionalInfo);
        Sentry.captureException(err);
      });
    } else {
      Sentry.captureException(err);
    }
    Sentry.captureException(err);
  }
}

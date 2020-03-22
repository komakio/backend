import { Module } from '@nestjs/common';
import { ExceptionsFilter } from './exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
import { SentryService } from './sentry/sentry.service';
import { ExceptionsService } from './exceptions.service';
import { LoggerModule } from '@backend/logger';
import { ConfigModule } from '@backend/config';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    SentryService,
    ExceptionsService,
  ],
  exports: [ExceptionsService],
  imports: [ConfigModule, LoggerModule],
})
export class ExceptionsModule {}

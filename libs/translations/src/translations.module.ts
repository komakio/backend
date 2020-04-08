import { Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { RedisModule } from '@backend/redis';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';

@Module({
  providers: [TranslationsService],
  imports: [RedisModule, ConfigModule, LoggerModule],
  exports: [TranslationsService],
})
export class TranslationsModule {}

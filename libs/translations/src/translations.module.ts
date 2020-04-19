import { Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { RedisModule } from '@backend/redis';
import { LoggerModule } from '@backend/logger';
import { TranslationsRedisService } from './services/translations-redis.service';
import { ExceptionsModule } from '@backend/exceptions';

@Module({
  providers: [TranslationsService, TranslationsRedisService],
  imports: [RedisModule, LoggerModule, ExceptionsModule],
  exports: [TranslationsService],
})
export class TranslationsModule {}

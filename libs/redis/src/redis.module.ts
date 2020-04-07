import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './health';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';

@Module({
  providers: [RedisService, RedisHealthIndicator],
  imports: [ConfigModule, LoggerModule],
  exports: [RedisService, RedisHealthIndicator],
})
export class RedisModule {}

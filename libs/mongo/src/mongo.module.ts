import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';
import { MongoHealthIndicator } from './health';

@Module({
  providers: [MongoService, MongoHealthIndicator],
  imports: [ConfigModule, LoggerModule],
  exports: [MongoService, MongoHealthIndicator],
})
export class MongoModule {}

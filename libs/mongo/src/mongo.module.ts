import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';

@Module({
  providers: [MongoService],
  imports: [ConfigModule, LoggerModule],
  exports: [MongoService],
})
export class MongoModule {}

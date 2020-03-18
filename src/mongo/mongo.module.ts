import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { ConfigModule } from 'src/config/config.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  providers: [MongoService],
  imports: [ConfigModule, LoggerModule],
  exports: [MongoService]
})
export class MongoModule {}

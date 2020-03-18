import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  providers: [MongoService],
  imports: [ConfigModule]
})
export class MongoModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [MongoModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

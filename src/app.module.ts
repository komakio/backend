import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [MongoModule, ConfigModule, LoggerModule, UsersModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

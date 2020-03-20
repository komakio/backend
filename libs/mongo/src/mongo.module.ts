import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { ConfigModule } from '@config/config';
import { LoggerModule } from '@logger/logger';

@Module({
    providers: [MongoService],
    imports: [ConfigModule, LoggerModule],
    exports: [MongoService],
})
export class MongoModule {}

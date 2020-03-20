import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMongoService } from './services/users.mongo.service';
import { MongoModule } from 'src/mongo/mongo.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
    providers: [UsersService, UsersMongoService],
    controllers: [UsersController],
    imports: [MongoModule, ConfigModule],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMongoService } from './services/users.mongo.service';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
    providers: [UsersService, UsersMongoService],
    controllers: [UsersController],
    imports: [MongoModule],
})
export class UsersModule {}

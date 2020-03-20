import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMongoService } from './services/users.mongo.service';
import { MongoModule } from 'src/mongo/mongo.module';
import { ConfigModule } from 'src/config/config.module';
import { AuthService } from './auth/services/auth.service';

@Module({
    providers: [UsersService, UsersMongoService, AuthService],
    controllers: [UsersController],
    imports: [MongoModule, ConfigModule],
})
export class UsersModule {}

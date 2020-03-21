import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMongoService } from './services/users.mongo.service';
import { AuthService } from './auth/services/auth.service';
import { MongoModule } from '@mongo/mongo';
import { ConfigModule } from '@config/config';

@Module({
    providers: [UsersService, UsersMongoService, AuthService],
    controllers: [UsersController],
    imports: [MongoModule, ConfigModule],
    exports: [UsersService, AuthService],
})
export class UsersModule {}

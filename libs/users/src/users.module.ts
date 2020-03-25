import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMongoService } from './services/users.mongo.service';
import { AuthService } from './auth/services/auth.service';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { AppleService } from './auth/services/apple.service';
import { GoogleService } from './auth/services/google.service';

@Module({
  providers: [
    UsersService,
    UsersMongoService,
    AuthService,
    AppleService,
    GoogleService,
  ],
  controllers: [UsersController],
  imports: [MongoModule, ConfigModule],
  exports: [UsersService, AuthService],
})
export class UsersModule {}

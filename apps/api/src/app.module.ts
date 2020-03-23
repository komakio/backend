import { Module } from '@nestjs/common';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';
import { UsersModule } from '@backend/users';
import { ProfilesModule } from '@backend/profiles';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@backend/users/auth/auth.guard';
import { RequestsModule } from 'libs/requests/src';
import { TerminusModule } from '@nestjs/terminus';
import { TerminusOptionsService } from './terminus-options.service';

const modules = [
  MongoModule,
  ProfilesModule,
  ConfigModule,
  LoggerModule,
  UsersModule,
  RequestsModule,
];
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [TerminusModule.forRootAsync({
    useClass: TerminusOptionsService,
  }), ...modules],
})
export class AppModule {}

@Module({
  imports: [...modules],
})
export class AppConsumerModule {}

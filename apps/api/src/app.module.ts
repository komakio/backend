import { Module } from '@nestjs/common';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';
import { UsersModule } from '@backend/users';
import { ProfilesModule } from '@backend/profiles';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@backend/users/auth/auth.guard';
import { RequestsModule } from '@backend/requests/requests.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health-controller.controller';
import { GeocoderModule } from '@backend/geocoder/geocoder.module';

const modules = [
  MongoModule,
  ProfilesModule,
  ConfigModule,
  LoggerModule,
  UsersModule,
  RequestsModule,
  GeocoderModule,
];
@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [TerminusModule, ...modules],
})
export class AppModule {}

@Module({
  imports: [...modules],
})
export class AppConsumerModule {}

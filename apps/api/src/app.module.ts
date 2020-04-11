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
import { ExceptionsModule } from '@backend/exceptions';
import { RabbitmqModule } from '@backend/rabbitmq';
import { RedisHealthIndicator } from '@backend/redis/health';
import { MongoHealthIndicator } from '@backend/mongo/health';
import { RedisModule } from '@backend/redis';
import { PublicModule } from '@backend/public';
import { TranslationsModule } from '@backend/translations';
import { GroupsModule } from '@backend/groups';

const modules = [
  MongoModule,
  ProfilesModule,
  ConfigModule,
  LoggerModule,
  UsersModule,
  RequestsModule,
  GeocoderModule,
  ExceptionsModule,
  RabbitmqModule,
  RedisModule,
  PublicModule,
  TranslationsModule,
  GroupsModule,
];
@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    RedisHealthIndicator,
    MongoHealthIndicator,
  ],
  imports: [TerminusModule, ...modules],
})
export class AppModule {}

@Module({
  imports: [...modules],
})
export class AppConsumerModule {}

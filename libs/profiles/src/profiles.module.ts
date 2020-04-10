import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesMongoService } from './services/profiles-mongo.service';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { ProfilesRabbitMQService } from './services/profiles-rabbitmq.service';
import { RabbitmqModule } from '@backend/rabbitmq';
import { UsersModule } from '@backend/users';
import { ProfilesGroupsMongoService } from './services/profiles-groups-mongo.service';

@Module({
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    ProfilesMongoService,
    ProfilesRabbitMQService,
    ProfilesGroupsMongoService,
  ],
  imports: [MongoModule, ConfigModule, RabbitmqModule, UsersModule],
  exports: [ProfilesService],
})
export class ProfilesModule {}

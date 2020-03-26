import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { ProfilesRabbitMQService } from './services/profiles-rabbitmq.service';
import { RabbitmqModule } from '@backend/rabbitmq';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfilesMongoService, ProfilesRabbitMQService],
  imports: [MongoModule, ConfigModule, RabbitmqModule],
  exports: [ProfilesService],
})
export class ProfilesModule {}

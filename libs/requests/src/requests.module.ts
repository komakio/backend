import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { MongoModule } from '@backend/mongo';
import { RabbitmqModule } from '@backend/rabbitmq';
import { ConfigModule } from '@backend/config';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { RequestsMongoService } from './services/requests-mongo.service';
import { DispatchRequestsConsumer } from './consumers/dispatch-requests.consumer';
import { LoggerModule } from '@backend/logger';
import { ProfilesModule } from '@backend/profiles';
import { RequestsController } from './controllers/requests.controller';
import { NotificationsModule } from '@backend/notifications';
import { UsersModule } from '@backend/users';
import { ProfilesRequestsController } from './controllers/profiles-requests.controller';
import { SubscribeNewHelperConsumer } from './consumers/subscribe-new-helper.consumer';

@Module({
  controllers: [RequestsController, ProfilesRequestsController],
  providers: [
    RequestsService,
    RequestsMongoService,
    RequestsRabbitMQService,
    DispatchRequestsConsumer,
    SubscribeNewHelperConsumer,
  ],
  imports: [
    MongoModule,
    RabbitmqModule,
    ConfigModule,
    LoggerModule,
    ProfilesModule,
    NotificationsModule,
    UsersModule,
  ],
  exports: [RequestsService],
})
export class RequestsModule {}

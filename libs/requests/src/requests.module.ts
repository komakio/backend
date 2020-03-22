import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { MongoModule } from '@mongo/mongo';
import { RabbitmqModule } from '@rabbitmq/rabbitmq';
import { ConfigModule } from '@config/config';
import { ExceptionsModule } from 'libs/exceptions/src';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { RequestsMongoService } from './services/requests-mongo.service';
import { RequestsConsumer } from './consumers/requests.consumer';
import { LoggerModule } from '@logger/logger';
import { ProfilesModule } from '@profiles/profiles';
import { RequestsController } from './requests.controller';
import { NotificationsModule } from '@notifications/notifications';

@Module({
    controllers: [RequestsController],
    providers: [RequestsService, RequestsMongoService, RequestsRabbitMQService, RequestsConsumer],
    imports: [MongoModule, RabbitmqModule, ConfigModule, LoggerModule, ProfilesModule, ExceptionsModule, NotificationsModule],
    exports: [RequestsService],
})
export class RequestsModule {}

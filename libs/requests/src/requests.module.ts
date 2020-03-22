import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { MongoModule } from '@backend/mongo';
import { RabbitmqModule } from '@backend/rabbitmq';
import { ConfigModule } from '@backend/config';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { RequestsMongoService } from './services/requests-mongo.service';
import { RequestsConsumer } from './consumers/requests.consumer';
import { LoggerModule } from '@backend/logger';
import { ProfilesModule } from '@backend/profiles';
import { RequestsController } from './requests.controller';
import { NotificationsModule } from '@backend/notifications';

@Module({
    controllers: [RequestsController],
    providers: [RequestsService, RequestsMongoService, RequestsRabbitMQService, RequestsConsumer],
    imports: [
        MongoModule,
        RabbitmqModule,
        ConfigModule,
        LoggerModule,
        ProfilesModule,
        NotificationsModule,
    ],
    exports: [RequestsService],
})
export class RequestsModule {}

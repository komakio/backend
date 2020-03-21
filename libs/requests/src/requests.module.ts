import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { MongoModule } from '@mongo/mongo';
import { UsersModule } from '@users/users';
import { RabbitmqModule } from '@rabbitmq/rabbitmq';
import { ConfigModule } from '@config/config';
import { ExceptionsModule } from 'libs/exceptions/src';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { RequestsMongoService } from './services/requests-mongo.service';
import { RequestsConsumer } from './consumers/requests.consumer';
import { LoggerModule } from '@logger/logger';
import { ProfilesModule } from '@profiles/profiles';

@Module({
    providers: [RequestsService, RequestsMongoService, RequestsRabbitMQService, RequestsConsumer],
    imports: [MongoModule, UsersModule, RabbitmqModule, ConfigModule, ExceptionsModule, LoggerModule, ProfilesModule],
    exports: [RequestsService],
})
export class RequestsModule {}

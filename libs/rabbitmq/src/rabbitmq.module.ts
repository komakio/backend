import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { LoggerModule } from '@logger/logger';
import { ConfigModule } from '@config/config';

@Module({
    providers: [RabbitMQService],
    exports: [RabbitMQService],
    imports: [ConfigModule, LoggerModule],
})
export class RabbitmqModule {}

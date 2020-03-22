import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { LoggerModule } from '@backend/logger';
import { ConfigModule } from '@backend/config';

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
  imports: [ConfigModule, LoggerModule],
})
export class RabbitmqModule {}

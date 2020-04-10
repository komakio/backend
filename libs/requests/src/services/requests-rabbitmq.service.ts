import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import { BatchwiseNotificationsQueue } from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
  public BatchwiseNotificationsQueueName = `${this.config.rabbitmq.prefix}BatchwiseNotificationsQueue`;

  constructor(
    private config: ConfigService,
    private rabbitMQ: RabbitMQService
  ) {}

  public async sendToBatchwiseNotifications(
    message: BatchwiseNotificationsQueue
  ) {
    await this.rabbitMQ.sendToQueueWithDelay({
      queueName: this.BatchwiseNotificationsQueueName,
      message,
      delayTimeMs: !message?.sentProfileIds?.length
        ? 1
        : this.config.delayNotificationTime,
    });
  }
}

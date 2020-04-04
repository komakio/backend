import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import {
  BatchwiseNotificationsQueue,
  DispatchRequestQueue,
} from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
  public dispatchRequestQueueName = `${this.config.rabbitmq.prefix}dispatchRequestQueue`;
  public BatchwiseNotificationsQueueName = `${this.config.rabbitmq.prefix}BatchwiseNotificationsQueue`;

  constructor(
    private config: ConfigService,
    private rabbitMQ: RabbitMQService
  ) {}

  public async sendToDispatchRequests(message: DispatchRequestQueue) {
    await this.rabbitMQ.sendToQueue({
      queueName: this.dispatchRequestQueueName,
      message,
    });
  }

  public async sendToBatchwiseNotifications(
    message: BatchwiseNotificationsQueue
  ) {
    await this.rabbitMQ.sendToQueueWithDelay({
      queueName: this.BatchwiseNotificationsQueueName,
      message,
      delayTimeMs: !message?.sentProfileIds?.length ? 1 : 10 * 60 * 1000,
    });
  }
}

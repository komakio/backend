import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import {
  NotificationsRequestQueue,
  DispatchRequestQueue,
} from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
  public dispatchRequestQueueName = `${this.config.rabbitmq.prefix}dispatchRequestQueue`;
  public notificationsRequestQueueName = `${this.config.rabbitmq.prefix}notificationsRequestQueue`;

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
    message: NotificationsRequestQueue
  ) {
    await this.rabbitMQ.sendToQueueWithDelay({
      queueName: this.notificationsRequestQueueName,
      message,
      delayTimeMs: !message?.sentProfileIds?.length ? 1 : 10 * 60 * 1000,
    });
  }
}

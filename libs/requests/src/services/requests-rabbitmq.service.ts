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

  public async sendToNotifications(props: NotificationsRequestQueue) {
    await this.rabbitMQ.sendToQueue(this.notificationsRequestQueueName, props);
  }
}

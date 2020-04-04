import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import { SubscribeNewHelperRequestQueue } from '@backend/requests/requests.model';

@Injectable()
export class ProfilesRabbitMQService {
  public subscribeNewHelperRequestQueueName = `${this.config.rabbitmq.prefix}subscribeNewHelperRequestQueue`;

  constructor(
    private config: ConfigService,
    private rabbitMQ: RabbitMQService
  ) {}

  public async sendToSubscribeNewHelperRequests(
    message: SubscribeNewHelperRequestQueue
  ) {
    await this.rabbitMQ.sendToQueue({
      queueName: this.subscribeNewHelperRequestQueueName,
      message,
    });
  }
}

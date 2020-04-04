import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import { DispatchRequestQueue } from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
  public dispatchRequestQueueName = `${this.config.rabbitmq.prefix}dispatchRequestQueue`;

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
}

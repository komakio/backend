import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { RabbitMQService } from '@backend/rabbitmq';
import {
  DispatchRequestQueue,
  AcceptRequestQueue,
  SubscribeNewHelperRequestQueue,
} from '../requests.model';

@Injectable()
export class RequestsRabbitMQService {
  public dispatchRequestQueueName = `${this.config.rabbitmq.prefix}dispatchRequestQueue`;
  public acceptRequestQueueName = `${this.config.rabbitmq.prefix}acceptRequestQueue`;
  public subscribeNewHelperRequestQueueName = `${this.config.rabbitmq.prefix}subscribeNewHelperRequestQueue`;

  constructor(
    private config: ConfigService,
    private rabbitMQ: RabbitMQService
  ) {}

  public async sendToDispatchRequests(props: DispatchRequestQueue) {
    await this.rabbitMQ.sendToQueue(this.dispatchRequestQueueName, props);
  }
  public async sendToAcceptRequests(props: AcceptRequestQueue) {
    await this.rabbitMQ.sendToQueue(this.acceptRequestQueueName, props);
  }
  public async sendToSubscribeNewHelperRequests(
    props: SubscribeNewHelperRequestQueue
  ) {
    await this.rabbitMQ.sendToQueue(
      this.subscribeNewHelperRequestQueueName,
      props
    );
  }
}

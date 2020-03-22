import { Injectable } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';

export interface RabbitMQServiceInterface {
  url: string;
  connect: () => void;
  sendToQueue: (queueName: string, value: any) => void;
  publishToExchange: (exchangeName: string, value: any) => void;
}

@Injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
  public url = this.config.rabbitmq.user
    ? `amqp://${this.config.rabbitmq.user}:${this.config.rabbitmq.password}@${this.config.rabbitmq.host}:${this.config.rabbitmq.port}`
    : `amqp://${this.config.rabbitmq.host}:${this.config.rabbitmq.port}`;

  private channel: amqp.ChannelWrapper;

  constructor(private config: ConfigService, private logger: LoggerService) {}

  public connect() {
    if (this.channel) {
      return;
    }

    const connection = amqp.connect([this.url], { reconnectTimeInSeconds: 1 });

    this.channel = connection.createChannel({
      json: true,
    });
    this.channel.addListener('connect', () => {
      this.logger.debug('RabbitMQ connected');
    });
  }

  public async sendToQueue(queueName: string, value: any) {
    await this.channel.sendToQueue(queueName, value, {
      persistent: true,
    });
  }

  public async publishToExchange(exchangeName: string, value: any) {
    await this.channel.publish(exchangeName, '', value, {
      persistent: true,
    });
  }
}

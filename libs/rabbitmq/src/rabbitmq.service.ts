import { Injectable } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';

export interface RabbitMQServiceInterface {
  url: string;
  connect: () => void;
  sendToQueue: (args: { queueName: string; message: any }) => void;
  sendToQueueWithDelay: (args: {
    queueName: string;
    message: any;
    delayTime: number;
  }) => void;
  publishToExchange: (args: { exchangeName: string; message: any }) => void;
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
      setup: channel => {
        channel.assertExchange('delayed-exchange', 'x-delayed-message', {
          arguments: { 'x-delayed-type': 'direct' },
          durable: false,
        });
      },
    });
    this.channel.addListener('connect', () => {
      this.logger.debug('RabbitMQ connected');
    });
  }

  public async sendToQueue(args: { queueName: string; message: any }) {
    await this.channel.sendToQueue(args.queueName, args.message, {
      persistent: true,
    });
  }

  public async sendToQueueWithDelay(args: {
    queueName: string;
    message: any;
    delayTime: number;
  }) {
    await this.channel.addSetup(channel => {
      return channel.bindQueue(args.queueName, 'delayed-exchange', '');
    });
    await this.channel.publish('delayed-exchange', '', args.message, {
      headers: { 'x-delay': args.delayTime },
    });
  }

  public async publishToExchange(args: { exchangeName: string; message: any }) {
    await this.channel.publish(args.exchangeName, '', args.message, {
      persistent: true,
    });
  }
}

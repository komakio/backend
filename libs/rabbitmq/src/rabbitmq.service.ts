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
    delayTimeMs: number;
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

  public async connect() {
    if (this.channel) {
      return;
    }

    const connection = amqp.connect([this.url], { reconnectTimeInSeconds: 1 });

    this.channel = connection.createChannel({
      json: true,
    });
    return new Promise(resolve => {
      this.channel.addListener('connect', () => {
        console.log({ channel: this.channel });

        this.logger.debug('RabbitMQ connected');
        resolve();
      });
    });
  }

  public initDelayedExchange(queueName: string) {
    this.channel.addSetup(ch => {
      ch.assertExchange(`delayed-exchange-${queueName}`, 'x-delayed-message', {
        arguments: { 'x-delayed-type': 'direct' },
        durable: true,
      });
      ch.bindQueue(queueName, `delayed-exchange-${queueName}`, '');
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
    delayTimeMs: number;
  }) {
    await this.publishToExchange({
      exchangeName: `delayed-exchange-${args.queueName}`,
      message: args.message,
      headers: { 'x-delay': args.delayTimeMs },
    });
  }

  public async publishToExchange(args: {
    exchangeName: string;
    message: any;
    headers: object;
  }) {
    await this.channel.publish(args.exchangeName, '', args.message, {
      headers: args.headers,
      persistent: true,
    });
  }
}

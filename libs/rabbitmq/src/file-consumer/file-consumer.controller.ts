import { Controller, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { ConsumeMessageFields } from 'amqplib';
import { LoggerService } from '@backend/logger';
import { RMQHelper, RMQ } from '../rabbitmq.decorator';

export interface FileConsumerMessage {
  content: any;
  fields: ConsumeMessageFields;
  rabbitMQ: boolean;
}

@Controller('file-consumer')
export class FileConsumerController {
  constructor(
    @Inject('FILENAME') private filename: string,
    @Inject('SHOULD_CONNECT_RABBITMQ') private shouldConnectRabbitMQ: boolean,
    private logger: LoggerService
  ) {}

  @EventPattern()
  public async consume(
    @RMQ()
    { message, ack, nack, fields }: RMQHelper<any>
  ): Promise<void> {
    const filePath = path.join(__dirname, `${this.filename}.js`);

    const workerData: FileConsumerMessage = {
      content: message,
      fields,
      rabbitMQ: this.shouldConnectRabbitMQ,
    };

    const worker = new Worker(filePath, { workerData });

    worker.on('message', msg => {
      if (msg === 'ack') {
        ack();
      }
      if (msg === 'nack') {
        nack();
      }
      if (msg === 'ack' || msg === 'nack') {
        worker.terminate();
      }
    });
    worker.on('data', () => console.log('data'));
    worker.on('error', () => {
      worker.terminate();
    });
    worker.on('exit', code => {
      this.logger.debug(`Worker ${this.filename} done with exit code ${code}.`);
    });
  }
}

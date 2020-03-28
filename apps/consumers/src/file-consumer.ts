import { NestFactory } from '@nestjs/core';
import { workerData, parentPort } from 'worker_threads';
import { AppConsumerModule } from 'apps/api/src/app.module';
import { LoggerService } from '@backend/logger';
import { RabbitMQService } from '@backend/rabbitmq';
import { FileConsumerMessage } from '@backend/rabbitmq/file-consumer/file-consumer.controller';

const file = __filename.substring(__filename.lastIndexOf('/') + 1);
const filename = file.substring(0, file.length - 3);

const data: FileConsumerMessage = workerData;

const ack = () => parentPort.postMessage('ack');
const nack = () => parentPort.postMessage('nack');

async function bootstrap() {
  const logger = new LoggerService(true);
  const app = await NestFactory.createApplicationContext(AppConsumerModule, {
    logger,
  });

  if (data.rabbitMQ) {
    app.get(RabbitMQService).connect();
  }

  await app.get(filename).consume({
    ack,
    nack,
    message: data.content,
    fields: data.fields,
  });
}
bootstrap();

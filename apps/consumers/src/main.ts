import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConsumerModule } from '@backend/rabbitmq/consumer/consumer.module';
import { LoggerService } from '@backend/logger';
import { AppConsumerModule } from '@apps/api/src/app.module';
import { RabbitmqModule, RabbitMQService } from '@backend/rabbitmq';
import { RequestsRabbitMQService } from '@backend/requests/services/requests-rabbitmq.service';
import { DispatchRequestsConsumer } from '@backend/requests/consumers/dispatch-requests.consumer';
import { SubscribeNewHelperConsumer } from '@backend/requests/consumers/subscribe-new-helper.consumer';
import { ProfilesRabbitMQService } from '@backend/profiles/services/profiles-rabbitmq.service';
import { ExceptionsService } from '@backend/exceptions';
import { BatchwiseNotificationsConsumer } from '@backend/requests/consumers/notifications.consumer';

const logger = new LoggerService();

async function bootstrapQueue(args: {
  module: any;
  queueName: string;
  prefetchCount: number;
  withDelayedExchange?: boolean;
  rabbitmq: any;
}) {
  // const appConfigContext = await NestFactory.createApplicationContext(
  //   RabbitmqModule,
  //   { logger }
  // );
  // const rabbitMQ = appConfigContext.get(RabbitMQService);

  const app = await NestFactory.createMicroservice(args.module, {
    transport: Transport.RMQ,
    options: {
      urls: [args.rabbitmq.url],
      queue: args.queueName,
      prefetchCount: args.prefetchCount,
      queueOptions: { durable: true },
      noAck: false,
    },
    logger,
  });
  app.listen(() => {
    if (args.withDelayedExchange) {
      args.rabbitmq.initDelayedExchange(args.queueName);
    }
    // logger.log(`Listening to ${queueName}, prefetch ${prefetchCount}`);
  });
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppConsumerModule, {
    logger,
  });
  const rabbitmq = app.get(RabbitMQService);
  await rabbitmq.connect();
  console.log('connected');

  process.on('uncaughtException', (err: Error) => {
    app.get(ExceptionsService).report(err);
  });

  const requestsRabbitMQ = app.get(RequestsRabbitMQService);
  const profilesRabbitMQ = app.get(ProfilesRabbitMQService);

  await Promise.all([
    bootstrapQueue({
      module: ConsumerModule.register(app.get(DispatchRequestsConsumer)),
      queueName: requestsRabbitMQ.dispatchRequestQueueName,
      prefetchCount: 30,
      rabbitmq,
    }),
    bootstrapQueue({
      module: ConsumerModule.register(app.get(SubscribeNewHelperConsumer)),
      queueName: profilesRabbitMQ.subscribeNewHelperRequestQueueName,
      prefetchCount: 30,
      rabbitmq,
    }),
    bootstrapQueue({
      module: ConsumerModule.register(app.get(BatchwiseNotificationsConsumer)),
      queueName: requestsRabbitMQ.BatchwiseNotificationsQueueName,
      prefetchCount: 30,
      withDelayedExchange: true,
      rabbitmq,
    }),
  ]);
}
bootstrap();

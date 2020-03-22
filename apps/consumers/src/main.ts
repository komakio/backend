import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConsumerModule } from 'libs/rabbitmq/src/consumer/consumer.module';
import { LoggerService } from '@backend/logger';
// import { ExceptionsService } from 'libs/exceptions/src';
import { AppConsumerModule } from 'apps/api/src/app.module';
import { RabbitmqModule, RabbitMQService } from '@backend/rabbitmq';
import { RequestsRabbitMQService } from 'libs/requests/src/services/requests-rabbitmq.service';
import { RequestsConsumer } from 'libs/requests/src/consumers/requests.consumer';

const logger = new LoggerService();

async function bootstrapQueue(Module: any, queueName: string, prefetchCount: number) {
    const appConfigContext = await NestFactory.createApplicationContext(RabbitmqModule, { logger });
    const rabbitMQ = appConfigContext.get(RabbitMQService);

    const app = await NestFactory.createMicroservice(Module, {
        transport: Transport.RMQ,
        options: {
            urls: [rabbitMQ.url],
            queue: queueName,
            prefetchCount,
            queueOptions: { durable: true },
            noAck: false,
        },
        logger,
    });
    app.listen(() => {
        // logger.log(`Listening to ${queueName}, prefetch ${prefetchCount}`);
    });
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppConsumerModule, {
        logger,
    });
    app.get(RabbitMQService).connect();

    // process.on('uncaughtException', (err: Error) => {
    //     app.get(ExceptionsService).report(err);
    // });

    const requestsRabbitMQ = app.get(RequestsRabbitMQService);

    await Promise.all([
        bootstrapQueue(ConsumerModule.register(app.get(RequestsConsumer)), requestsRabbitMQ.requestQueueName, 30),
    ]);
}
bootstrap();

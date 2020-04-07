import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RabbitMQService } from '@backend/rabbitmq';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionsService } from '@backend/exceptions';
import { ConfigService } from '@backend/config';
import RedisStore from 'rate-limit-redis';
import RateLimit from 'express-rate-limit';
import { RedisService } from '@backend/redis';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  process.on('uncaughtException', (err: Error) => {
    app.get(ExceptionsService).report(err);
  });

  const redis = app.get(RedisService);
  await redis.waitReady();

  await app.get(RabbitMQService).connect();
  app.use(
    new RateLimit({
      store: new RedisStore({
        client: redis.db,
        prefix: `${redis.prefix}:ratelimit:`,
      }),
      max: 100,
      delayMs: 0, // disable delaying - full speed until the max limit is reached
      keyGenerator: (req: Request) => req.headers.authorization || req.ip,
    })
  );

  const options = new DocumentBuilder()
    .setTitle('Komak')
    .setDescription('The Komak API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const config = app.get(ConfigService);

  if (config.env !== 'production') {
    app.enableCors();
  }

  await app.listen(3100);
}
bootstrap();

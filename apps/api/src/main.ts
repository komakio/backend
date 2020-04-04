import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RabbitMQService } from '@backend/rabbitmq';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionsService } from '@backend/exceptions';
import { ConfigService } from '@backend/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  process.on('uncaughtException', (err: Error) => {
    app.get(ExceptionsService).report(err);
  });

  await app.get(RabbitMQService).connect();
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

import { Module, DynamicModule } from '@nestjs/common';
import { FileConsumerController } from './file-consumer.controller';
import { LoggerModule } from '@backend/logger';

@Module({})
export class FileConsumerModule {
  public static register(
    filename: string,
    shouldConnectRabbitMQ: boolean
  ): DynamicModule {
    return {
      module: FileConsumerModule,
      controllers: [FileConsumerController],
      imports: [LoggerModule],
      providers: [
        {
          provide: 'FILENAME',
          useValue: filename,
        },
        {
          provide: 'SHOULD_CONNECT_RABBITMQ',
          useValue: shouldConnectRabbitMQ,
        },
      ],
    };
  }
}

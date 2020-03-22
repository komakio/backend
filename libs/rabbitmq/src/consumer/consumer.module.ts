import { Module, DynamicModule } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { LoggerModule } from '@backend/logger';

@Module({})
export class ConsumerModule {
  public static register(Service: string): DynamicModule {
    return {
      module: ConsumerModule,
      controllers: [ConsumerController],
      imports: [LoggerModule],
      providers: [
        {
          provide: 'CONSUMER_SERVICE',
          useValue: Service,
        },
      ],
    };
  }
}

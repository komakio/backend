import { Controller, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ConsumerService, RMQ, RMQHelper } from '../rabbitmq.decorator';

@Controller('consumer')
export class ConsumerController {
  constructor(@Inject('CONSUMER_SERVICE') private service: ConsumerService) {}

  @EventPattern()
  public async consume(
    @RMQ()
    { message, ack, nack, fields }: RMQHelper<any>
  ): Promise<void> {
    await this.service.consume({
      ack,
      nack,
      message,
      fields,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { SubscribeNewHelperRequestQueue } from '../requests.model';
import { RequestsService } from '../requests.service';

@Injectable()
export class SubscribeNewHelperConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private requests: RequestsService
  ) {}

  public async consume({
    message,
    ack,
  }: RMQHelper<SubscribeNewHelperRequestQueue>) {
    const { profileId, registrationToken } = message;
    try {
      await this.mongo.waitReady();
      await this.requests.subscribeToRequests({ profileId, registrationToken });
      ack();
    } catch (err) {
      this.logger.verbose({
        route: 'subscribe-new-helper-request-queue',
        error: err?.message,
      });
      ack('failed');
    }
  }
}

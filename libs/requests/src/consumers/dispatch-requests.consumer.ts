import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { DispatchRequestQueue } from '../requests.model';
import { ObjectID } from 'mongodb';
import { RequestsService } from '../requests.service';

@Injectable()
export class DispatchRequestsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private requests: RequestsService
  ) {}

  public async consume({ message, ack }: RMQHelper<DispatchRequestQueue>) {
    const { profileId, requestId } = message;
    try {
      await this.mongo.waitReady();
      await this.requests.dispatchRequest({
        profileId: new ObjectID(profileId),
        requestId: new ObjectID(requestId),
      });
      ack();
    } catch (err) {
      this.logger.verbose({
        route: 'dispatch-request-queue',
        error: err?.message,
      });
      ack('failed');
    }
  }
}

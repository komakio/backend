import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { AcceptQueueRequest } from '../requests.model';
import { ProfilesService } from '@backend/profiles';
import { ObjectID } from 'mongodb';
import { NotificationsService } from '@backend/notifications';
import { RequestsService } from '../requests.service';

@Injectable()
export class AcceptRequestsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private profiles: ProfilesService,
    private notifications: NotificationsService,
    private requests: RequestsService
  ) {}

  public async consume({ message, ack }: RMQHelper<AcceptQueueRequest>) {
    const { requestId } = message;
    try {
      await this.mongo.waitReady();
      const request = await this.requests.findOneById(new ObjectID(requestId));
      const recipientProfiles = await this.profiles.findManyById({
        ids: request.profileIds,
      });
      await this.notifications.send({
        registrationTokens: recipientProfiles.map(
          r => Object.values(r.uuidRegTokenPair)[0]
        ),
        message: {
          title: 'The request accepted',
          body: 'The request accepted!',
          icon: 'icon',
        },
        payload: {
          requestId: requestId.toString(),
        },
      });

      ack();
    } catch (err) {
      this.logger.verbose({
        route: 'accept-request-queue',
        error: err?.message,
      });
      ack('failed');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { AcceptQueueRequest } from '../requests.model';
import { ProfilesService } from '@backend/profiles';
import { ObjectID } from 'mongodb';
import { NotificationsService } from '@backend/notifications';
import { RequestsService } from '../requests.service';
import { UsersService } from '@backend/users';

@Injectable()
export class AcceptRequestsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private profiles: ProfilesService,
    private notifications: NotificationsService,
    private requests: RequestsService,
    private users: UsersService
  ) {}

  public async consume({ message, ack }: RMQHelper<AcceptQueueRequest>) {
    const { requestId } = message;
    try {
      await this.mongo.waitReady();
      const request = await this.requests.findOneById(new ObjectID(requestId));
      const users = await this.users.findManyByIds(
        request.profileIds.map(id => new ObjectID(id))
      );
      const registrationTokens = users
        .filter(
          u => u.uuidRegTokenPair && Object.keys(u.uuidRegTokenPair).length
        )
        .map(u => Object.values(u.uuidRegTokenPair)?.[0]);

      await this.notifications.send({
        registrationTokens,
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

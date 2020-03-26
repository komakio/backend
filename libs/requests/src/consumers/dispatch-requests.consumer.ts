import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { DispatchRequestQueue } from '../requests.model';
import { ProfilesService } from '@backend/profiles';
import { ObjectID } from 'mongodb';
import { NotificationsService } from '@backend/notifications';
import { RequestsService } from '../requests.service';
import { UsersService } from '@backend/users';

@Injectable()
export class DispatchRequestsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private profiles: ProfilesService,
    private notifications: NotificationsService,
    private requests: RequestsService,
    private users: UsersService
  ) {}

  public async consume({ message, ack }: RMQHelper<DispatchRequestQueue>) {
    const { profileId, requestId } = message;
    try {
      await this.mongo.waitReady();
      const profiles = await this.profiles.findNearHelpersById(
        new ObjectID(profileId)
      );

      const users = await this.users.findManyByIds(
        profiles?.map(p => new ObjectID(p.userId))
      );

      const registrationTokens =
        users
          ?.filter(
            u => u.uuidRegTokenPair && Object.keys(u.uuidRegTokenPair).length
          )
          .map(u => Object.values(u.uuidRegTokenPair)?.[0]) || [];

      await this.requests.patchOne({
        id: new ObjectID(requestId),
        data: { profileIds: profiles?.map(p => p._id) },
      });

      await this.notifications.send({
        registrationTokens,
        message: {
          title: 'I need help',
          body: 'Please help me!',
          icon: 'icon',
        },
        payload: {
          requestId: requestId?.toString(),
        },
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

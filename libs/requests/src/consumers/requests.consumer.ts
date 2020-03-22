import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { QueueRequest } from '../requests.model';
import { ProfilesService } from '@backend/profiles';
import { ObjectID } from 'mongodb';
import { NotificationsService } from '@backend/notifications';
import { RequestsService } from '../requests.service';

@Injectable()
export class RequestsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private profiles: ProfilesService,
    private notifications: NotificationsService,
    private requests: RequestsService
  ) {}

  public async consume({ message, ack }: RMQHelper<QueueRequest>) {
    const { userId } = message;

    try {
      await this.mongo.waitReady();
      const profiles = await this.profiles.findNearHelpers({
        id: new ObjectID(userId),
        maxDistance: 1000,
      });
      const deviceIds = profiles.reduce((ids, profile) => {
        ids = [...ids, ...profile.deviceIds];
        return ids;
      }, []);

      await this.requests.createOne({
        status: 'pending',
        userIds: profiles.map(p => p._id),
        requestedUserId: userId,
        type: 'misc',
      });

      await this.notifications.send({
        deviceIds,
        message: {
          title: 'I need help',
          body: 'Please help me!',
          icon: 'icon',
        },
      });

      ack();
    } catch (err) {
      this.logger.verbose({
        route: 'request-queue',
        error: err?.message,
      });
      ack('failed');
    }
  }
}

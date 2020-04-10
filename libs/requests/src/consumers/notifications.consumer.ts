import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { LoggerService } from '@backend/logger';
import { RMQHelper } from '@backend/rabbitmq';
import { UsersService } from '@backend/users';
import { BatchwiseNotificationsQueue } from '../requests.model';
import { NotificationsService } from '@backend/notifications';
import { ObjectID } from 'mongodb';
import { RequestsService } from '../requests.service';
import { ProfilesService } from '@backend/profiles';
import { RequestsRabbitMQService } from '../services/requests-rabbitmq.service';
import { TranslationsService } from '@backend/translations';

@Injectable()
export class BatchwiseNotificationsConsumer {
  constructor(
    private mongo: MongoService,
    private logger: LoggerService,
    private notifications: NotificationsService,
    private users: UsersService,
    private requests: RequestsService,
    private profiles: ProfilesService,
    private requestsRabbitMQ: RequestsRabbitMQService,
    private translations: TranslationsService
  ) {}

  public async consume({
    message,
    ack,
  }: RMQHelper<BatchwiseNotificationsQueue>) {
    const { requestId } = message;
    const sentProfileIds = message.sentProfileIds || [];

    try {
      await this.mongo.waitReady();
      const request = await this.requests.findOneById(new ObjectID(requestId));

      if (request.status !== 'pending') {
        return ack();
      }

      const profileId = request.candidates.find(
        c => !sentProfileIds.includes(c.profileId.toString())
      )?.profileId;

      if (!profileId) {
        return ack();
      }

      const profile = await this.profiles.findOneById(new ObjectID(profileId));
      const user = await this.users.findOneById(new ObjectID(profile.userId));
      const registrationTokens = Object.values(user.uuidRegTokenPair || {});
      const translations = await this.translations.get({
        languageCode: user.language,
        variables: { name: request.requesterShortName },
      });

      await this.notifications.send({
        registrationTokens,
        message: {
          title: 'KOMAK',
          body: translations.BACKEND_NOTIFICATION_REQUEST_STARTED_V1,
          icon: '',
        },
        payload: {
          request: JSON.stringify(request),
        },
      });

      this.requestsRabbitMQ.sendToBatchwiseNotifications({
        requestId,
        sentProfileIds: [...sentProfileIds, profileId.toString()],
      });

      ack();
    } catch (err) {
      this.logger.verbose({
        route: 'batchwise-notifications-request-queue',
        error: err?.message,
      });
      ack('failed');
    }
  }
}

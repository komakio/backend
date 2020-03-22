import { Injectable } from '@nestjs/common';
import { ExceptionsService } from 'libs/exceptions/src';
import { MongoService } from '@mongo/mongo';
import { LoggerService } from '@logger/logger';
import { RMQHelper } from '@rabbitmq/rabbitmq';
import { QueueRequest } from '../requests.model';
import { ProfilesService } from '@profiles/profiles';
import { ObjectID } from 'mongodb';
import { NotificationsService } from '@notifications/notifications';

@Injectable()
export class RequestsConsumer {
    constructor(
        private exceptions: ExceptionsService,
        private mongo: MongoService,
        private logger: LoggerService,
        private profiles: ProfilesService,
        private notifications: NotificationsService
    ) {}

    public async consume({ message, ack }: RMQHelper<QueueRequest>) {
        const { userId } = message;

        try {
            await this.mongo.waitReady();
            const profiles = await this.profiles.findNearHelpers({ id: new ObjectID(userId), maxDistance: 1000 });
            const deviceIds = profiles.reduce((ids, profile) => {
                ids = [...ids, ...profile.deviceIds];
                return ids;
            }, []);
            await this.notifications.send({
                deviceIds,
                message: {
                    title: 'I need help',
                    body: 'Please help me!',
                    icon: 'icon'
                }
            })

            ack();
        } catch (err) {
            this.logger.verbose({
                route: 'request-queue',
                error: err?.message,
            });
            this.exceptions.report(err);
            ack('failed');
        }
    }
}

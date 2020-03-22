import { Injectable } from '@nestjs/common';
import * as fcm from 'node-gcm';
import { ConfigService } from '@backend/config';
import { SendNotificationArgs } from './notifications.model';
import { LoggerService } from '@backend/logger';
import { ExceptionsService } from '@backend/exceptions';

@Injectable()
export class NotificationsService {
    private sender: fcm.Sender;

    constructor(private config: ConfigService, private logger: LoggerService, private exceptions: ExceptionsService) {
        this.sender = new fcm.Sender(this.config.fcm.serverKey);
    }

    public async send(args: SendNotificationArgs) {
        // Prepare a message to be sent
        const message = new fcm.Message({
            priority: 'high',
            contentAvailable: true,
            delayWhileIdle: true,
            timeToLive: 60 * 60 * 24,
            dryRun: !this.config.isProduction,
            data: args.payload,
            notification: args.message,
        });

        // Actually send the message
        const promise = new Promise((resolve, reject) => {
            this.sender.send(message, { registrationTokens: args.deviceIds }, function(err, response) {
                if (err) {
                    reject(err);
                } else {
                    !this.config.isProduction ? console.log({ response }) : null;
                    resolve(response);
                }
            });
        });

        return promise;
    }
}

import { Injectable } from '@nestjs/common';
import * as fcm from 'node-gcm';
import { ConfigService } from '@backend/config';
import { SendNotificationArgs } from './notifications.model';
import { LoggerService } from '@backend/logger';
import { resolveIfOneResolves } from 'utils/promise';

@Injectable()
export class NotificationsService {
  private sender: fcm.Sender;

  constructor(private config: ConfigService, private logger: LoggerService) {
    this.sender = new fcm.Sender(this.config.fcm.serverKey);
  }

  public async send(args: SendNotificationArgs) {
    if (!args.registrationTokens?.length) {
      return;
    }
    // Prepare a message to be sent
    const promises = this.config.packageNames.map(packageName => {
      const message = new fcm.Message({
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 60 * 60 * 24,
        dryRun: !this.config.isProduction,
        restrictedPackageName: packageName,
        data: {
          ...args.payload,
          sound: 'default',
          msgcnt: '1',
          'content-available': '1',
          badge: '1',
        },
        notification: {
          ...args.message,
          sound: 'default',
          badge: '1',
        },
      });

      return new Promise((resolve, reject) => {
        this.sender.send(
          message,
          { registrationTokens: args.registrationTokens },
          (err, response) => {
            if (err) {
              this.logger.verbose({
                route: 'send-notification',
                registrationTokens: args.registrationTokens,
                message,
                error: err,
              });
              reject(err);
            } else {
              resolve({ response });
            }
          }
        );
      });
    });

    await resolveIfOneResolves(promises);
  }
}

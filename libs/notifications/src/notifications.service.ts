import { Injectable } from '@nestjs/common';
import * as fcm from 'node-gcm';
import { ConfigService } from '@backend/config';
import { SendNotificationArgs } from './notifications.model';
import { LoggerService } from '@backend/logger';

@Injectable()
export class NotificationsService {
  private sender: fcm.Sender;

  constructor(private config: ConfigService, private logger: LoggerService) {
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
      restrictedPackageName: this.config.packageName,
      data: args.payload,
      notification: args.message,
    });

    // Actually send the message
    const promise = new Promise((resolve, reject) => {
      this.sender.send(
        message,
        { registrationTokens: args.registrationTokens },
        (response, err) => {
          if (err) {
            this.logger.verbose({
              route: 'send-notification',
              registrationTokens: args.registrationTokens,
              message,
              error: err,
            });
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });

    return promise;
  }
}

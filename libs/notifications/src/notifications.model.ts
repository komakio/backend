import { IMessageOptions } from 'node-gcm';

export interface SendNotificationData {
  message: IMessageOptions['notification'];
  payload?: IMessageOptions['data'];
}

export interface SendNotificationArgs extends SendNotificationData {
  registrationTokens: string[];
}

import { IMessageOptions } from 'node-gcm';

export interface SendNotificationArgs {
  registrationTokens: string[];
  message: IMessageOptions['notification'];
  payload?: IMessageOptions['data'];
}

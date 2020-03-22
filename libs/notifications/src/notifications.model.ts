import { IMessageOptions } from 'node-gcm';

export interface SendNotificationArgs {
  deviceIds: string[];
  message: IMessageOptions['notification'];
  payload?: IMessageOptions['data'];
}

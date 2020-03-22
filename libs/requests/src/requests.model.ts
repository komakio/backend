import { ObjectID } from 'mongodb';

export const HelpRequestStatusEnum = [
  'pending',
  'canceled',
  'accepted',
  'used',
];
export type HelpRequestStatus = typeof HelpRequestStatusEnum[number];

export const RequestTypeEnum = ['misc'];
export type HelpRequestType = typeof RequestTypeEnum[number];

export class HelpRequest {
  public _id: ObjectID;
  public createdAt: Date;
  public status: HelpRequestStatus;
  public userIds: ObjectID[];
  public requestedUserId: ObjectID;
  public acceptedUserId: ObjectID;
  public type: HelpRequestType;
  public comment: string;
}

export class QueueRequest {
  public userId: ObjectID;
}

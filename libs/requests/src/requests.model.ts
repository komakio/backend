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
  public updatedAt: Date;
  public status: HelpRequestStatus;
  public profileIds: ObjectID[];
  public requesterProfileId: ObjectID;
  public acceptorProfileId: ObjectID;
  public type: HelpRequestType;
  public comment: string;
  public requesterShortName: string;
  public acceptorShortName: string;
}

export class DispatchQueueRequest {
  public profileId: ObjectID;
  public requestId: ObjectID;
}

export class AcceptQueueRequest {
  public requestId: ObjectID;
}

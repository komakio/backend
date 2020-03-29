import { ObjectID } from 'mongodb';
import { Location } from '@backend/profiles/profile.model';

export const HelpRequestStatusEnum = [
  'pending',
  'canceled',
  'accepted',
  'used',
] as const;
export type HelpRequestStatus = typeof HelpRequestStatusEnum[number];

export const RequestTypeEnum = ['misc'] as const;
export type HelpRequestType = typeof RequestTypeEnum[number];

export class HelpRequest {
  public _id: ObjectID;
  public createdAt: Date;
  public updatedAt: Date;
  public status: HelpRequestStatus;
  public candidates: { profileId: ObjectID; distance: number }[];
  public requesterProfileId: ObjectID;
  public acceptorProfileId: ObjectID;
  public type: HelpRequestType;
  public comment: string;
  public requesterShortName: string;
  public acceptorShortName: string;
  public location: Location;
}

export class DispatchRequestQueue {
  public profileId: ObjectID;
  public requestId: ObjectID;
}

export class SubscribeNewHelperRequestQueue {
  public profileId: ObjectID;
  public registrationTokens: string[];
}

import { ObjectID } from 'mongodb';
import { Location } from '@backend/profiles/profile.model';
import { ApiProperty } from '@nestjs/swagger';
import { SendNotificationData } from '@backend/notifications/notifications.model';

export const HelpRequestStatusEnum = [
  'pending',
  'canceled',
  'accepted',
  'used',
] as const;
export type HelpRequestStatus = typeof HelpRequestStatusEnum[number];

export const RequestTypeEnum = ['misc'] as const;
export type HelpRequestType = typeof RequestTypeEnum[number];

class Candidate {
  @ApiProperty({ type: String })
  public profileId: ObjectID;
  @ApiProperty()
  public distance: number;
}

export class HelpRequest {
  @ApiProperty({ type: String })
  public _id: ObjectID;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;
  @ApiProperty({ enum: HelpRequestStatusEnum })
  public status: HelpRequestStatus;
  @ApiProperty({ type: Candidate, isArray: true })
  public candidates: Candidate[];
  @ApiProperty()
  public requesterShortName: string;
  @ApiProperty({ type: String })
  public requesterProfileId: ObjectID;
  @ApiProperty()
  public acceptorShortName: string;
  @ApiProperty({ type: String })
  public acceptorProfileId: ObjectID;
  @ApiProperty()
  public acceptorDistance: number;
  @ApiProperty({ enum: RequestTypeEnum })
  public type: HelpRequestType;
  @ApiProperty()
  public comment: string;
  @ApiProperty({ type: Location })
  public location: Location;
}

export class DispatchRequestQueue {
  public profileId: ObjectID;
  public requestId: ObjectID;
}

export class SubscribeNewHelperRequestQueue {
  public profileId: ObjectID;
}

export interface BatchwiseNotificationsQueue {
  requestId: ObjectID;
  sentProfileIds?: string[];
}

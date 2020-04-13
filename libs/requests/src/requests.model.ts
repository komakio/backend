import { ObjectID } from 'mongodb';
import { Location } from '@backend/profiles/profile.model';
import { ApiProperty } from '@nestjs/swagger';

export enum HelpRequestStatusEnum {
  Pending = 'pending',
  Canceled = 'canceled',
  Accepted = 'accepted',
  Used = 'used',
}

export enum RequestTypeEnum {
  Misc = 'misc',
}

class Candidate {
  @ApiProperty({ type: String })
  public profileId: ObjectID;
  public distance: number;
}

export class HelpRequest {
  @ApiProperty({ type: String })
  public _id: ObjectID;
  public createdAt: Date;
  public updatedAt: Date;
  public status: HelpRequestStatusEnum;
  public candidates: Candidate[];
  public requesterShortName: string;
  @ApiProperty({ type: String })
  public requesterProfileId: ObjectID;
  public acceptorShortName: string;
  @ApiProperty({ type: String })
  public acceptorProfileId: ObjectID;
  public acceptorDistance: number;
  public type: RequestTypeEnum;
  public comment: string;
  public location: Location;
}

export class DispatchRequestQueue {
  @ApiProperty({ type: String })
  public profileId: ObjectID;
  @ApiProperty({ type: String })
  public requestId: ObjectID;
}

export class SubscribeNewHelperRequestQueue {
  @ApiProperty({ type: String })
  public profileId: ObjectID;
}

export interface BatchwiseNotificationsQueue {
  requestId: ObjectID;
  sentProfileIds?: string[];
}

export class RequestsStatistics {
  public pending: number;
  public accepted: number;
  public canceled: number;
  public used: number;
}

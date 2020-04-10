import { ObjectID } from 'mongodb';
import { BaseDbDocument } from '@backend/users/users.model';
import { ApiProperty } from '@nestjs/swagger';

export class Group extends BaseDbDocument {
  @ApiProperty()
  public managersUserIds: ObjectID[];
  @ApiProperty()
  public secret: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public url: string;
}

import { ObjectID } from 'mongodb';
import { BaseDbDocument } from '@backend/users/users.model';
import { ApiProperty } from '@nestjs/swagger';
import { classToClass, Exclude } from 'class-transformer';

export class Group implements BaseDbDocument {
  @ApiProperty()
  public _id: ObjectID;
  @ApiProperty()
  public createdAt?: Date;
  @ApiProperty()
  public updatedAt?: Date;
  @Exclude()
  @ApiProperty()
  public managersUserIds: ObjectID[];
  @Exclude()
  @ApiProperty()
  public secret: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public url: string;

  constructor(partial: Partial<Group>) {
    Object.assign(this, partial);
  }

  public toJson?() {
    return Object.assign(this, {
      _id: this._id
        ? typeof this._id === 'string'
          ? this._id
          : this._id.toHexString()
        : null,
    });
  }

  public serialize?(): Group {
    return classToClass(new Group(this)).toJson();
  }
}

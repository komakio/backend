import { ObjectID } from 'mongodb';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { classToClass, Exclude } from 'class-transformer';

export class Group {
  @ApiProperty({ type: String })
  public _id: ObjectID;
  public createdAt?: Date;
  public updatedAt?: Date;
  public name: string;
  @ApiPropertyOptional()
  public url: string;
  @Exclude()
  public managersUserIds: ObjectID[];
  @Exclude()
  public secret: string;

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

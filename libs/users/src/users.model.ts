import { ObjectID } from 'bson';
import { Exclude, classToClass } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const socialAuthType = ['apple', 'google'] as const;
export type SocialAuthType = typeof socialAuthType[number];

export class UuidRegTokenPair {
  [uuid: string]: string;
}

export class User {
  @ApiProperty()
  public _id: ObjectID;
  @Exclude()
  public socialAuthId?: string;
  @ApiProperty()
  public socialAuthType?: SocialAuthType;
  @ApiProperty()
  public createdAt?: Date;
  @ApiProperty()
  public updatedAt?: Date;
  @ApiProperty()
  public lastLoginAt?: Date;
  @ApiProperty()
  public isAdmin?: boolean;
  @ApiProperty()
  public isAnonymous?: boolean;
  @ApiProperty()
  public uuidRegTokenPair?: UuidRegTokenPair;
  @ApiProperty()
  public username?: string;
  @ApiProperty()
  public language?: string;
  @Exclude()
  public password?: string;

  constructor(partial: Partial<User>) {
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

  public serialize?(): User {
    return classToClass(new User(this)).toJson();
  }
}

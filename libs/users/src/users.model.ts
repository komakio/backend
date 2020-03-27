import { ObjectID } from 'bson';
import { Exclude, classToClass } from 'class-transformer';

export const socialAuthType = ['apple', 'google'] as const;
export type SocialAuthType = typeof socialAuthType[number];

export class UuidRegTokenPair {
  [uuid: string]: string;
}

export class User {
  public _id: ObjectID;
  @Exclude()
  public socialAuthId?: string;
  public socialAuthType?: SocialAuthType;
  public createdAt?: Date;
  public lastLoginAt?: Date;
  public isAdmin?: boolean;
  public uuidRegTokenPair?: UuidRegTokenPair;
  public username?: string;
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

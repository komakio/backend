import { ObjectID } from 'bson';
import { Exclude, classToClass } from 'class-transformer';

export const authType = ['apple', 'google'];
export type AuthType = typeof authType[number];

export class User {
  public _id: ObjectID;
  @Exclude()
  public authId?: string;
  public authType?: AuthType;
  public createdAt?: Date;
  public lastLoginAt?: Date;
  public isAdmin?: boolean;

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

import { ObjectID } from 'bson';
import { Exclude, classToClass } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccessTokenResponse } from './auth/auth.model';

export enum SocialAuthTypeEnum {
  Apple = 'apple',
  Google = 'google',
}

export class UuidRegTokenPair {
  [uuid: string]: string;
}

export class User {
  @ApiProperty({ type: String })
  public _id: ObjectID;
  @Exclude()
  public socialAuthId?: string;
  public socialAuthType?: SocialAuthTypeEnum;
  public createdAt?: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date;
  public isAnonymous?: boolean;
  public uuidRegTokenPair?: UuidRegTokenPair;
  public username?: string;
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

export class LoginResult {
  public user: User;
  public accessToken: AccessTokenResponse;
}

export class UsersStatistics {
  public google: number;
  public apple: number;
  public regular: number;
}

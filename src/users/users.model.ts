import { ObjectID } from 'bson';
import { Exclude } from 'class-transformer';

export class User {
  public _id: ObjectID;
  public createdAt: Date;
  public lastLoginAt?: Date;
  public uuid: string;

  @Exclude()
  public password?: string;
  public name: string;
}

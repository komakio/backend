import { Injectable } from '@nestjs/common';
import { User, AuthType } from '../users.model';
import { ObjectID } from 'mongodb';
import { MongoService } from '@backend/mongo';

const collection = 'users';
@Injectable()
export class UsersMongoService {
  constructor(private mongo: MongoService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { authType: 1 });
    this.mongo.addIndex(collection, { authId: 1 });
  }

  public async createOne(user: Partial<User>): Promise<User> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...user, createdAt: new Date() });
    return new User(req.ops[0]);
  }

  public async findOneById(id: ObjectID): Promise<User> {
    return this.mongo.db
      .collection(collection)
      .findOne({ _id: new ObjectID(id) });
  }

  public async findManyByIds(ids: ObjectID[]): Promise<User[]> {
    return this.mongo.db.collection(collection).findOne({ _id: { $in: ids } });
  }

  public async patchOneById(args: { id: ObjectID; data: Partial<User> }) {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne({ _id: new ObjectID(args.id) }, { $set: args.data });
  }

  public async findOneByAuthIdType(args: {
    authId: string;
    authType: AuthType;
  }): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db
      .collection(collection)
      .findOne({ authType: args.authType, authId: args.authId });
    return user ? new User(user) : null;
  }
}

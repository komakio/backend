import { Injectable } from '@nestjs/common';
import { User, SocialAuthType } from '../users.model';
import { ObjectID } from 'mongodb';
import { MongoService } from '@backend/mongo';

const collection = 'users';
@Injectable()
export class UsersMongoService {
  constructor(private mongo: MongoService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { SocialAuthType: 1 });
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
    return this.mongo.db
      .collection(collection)
      .find({ _id: { $in: ids } })
      .toArray();
  }

  public async patchOneById(args: {
    id: ObjectID;
    set: Partial<User>;
    unset: Partial<User>;
  }) {
    await this.mongo.waitReady();
    const query: any = {};
    if (args.set) {
      query.$set = args.set;
    }
    if (args.unset) {
      query.$unset = args.unset;
    }
    return this.mongo.db
      .collection(collection)
      .updateOne({ _id: new ObjectID(args.id) }, { ...query });
  }

  public async findOneBySocialAuth(args: {
    socialAuthId: string;
    socialAuthType: SocialAuthType;
  }): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db.collection(collection).findOne({
      socialAuthType: args.socialAuthType,
      socialAuthId: args.socialAuthId,
    });
    return user ? new User(user) : null;
  }

  public async findOneByUsername(username: string): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db
      .collection(collection)
      .findOne({ username });
    return user ? new User(user) : null;
  }
}

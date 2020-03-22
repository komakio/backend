import { Injectable } from '@nestjs/common';
import { User } from '../users.model';
import { ObjectID } from 'mongodb';
import { MongoService } from '@backend/mongo';

const collection = 'users';
@Injectable()
export class UsersMongoService {
  constructor(private mongo: MongoService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { username: 1 });
  }

  public async createOne(user: Partial<User>): Promise<User> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...user, createdAt: new Date() });
    return new User(req.ops[0]);
  }

  public async patchOneById(args: { id: ObjectID; data: Partial<User> }) {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne({ _id: new ObjectID(args.id) }, { $set: args.data });
  }

  public async findOneByUsername(username: string): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db
      .collection(collection)
      .findOne({ username });
    return user ? new User(user) : null;
  }
}

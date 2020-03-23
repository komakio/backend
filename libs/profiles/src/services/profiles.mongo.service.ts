import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { Profile } from '../profile.model';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';

const collection = 'profiles';
@Injectable()
export class ProfilesMongoService {
  constructor(private mongo: MongoService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { userId: 1 });
    this.mongo.addIndex(collection, { role: 1 });
    this.mongo.addIndex(collection, { country: 1 });
    this.mongo.addIndex(collection, { disabled: 1 });
    this.mongo.addIndex(collection, { location: '2dsphere' });
  }

  public async createOne(profile: Partial<Profile>): Promise<Profile> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...profile, createdAt: new Date() });
    return req.ops[0];
  }

  public async patchOneById(args: {
    id: ObjectID;
    data: Partial<Profile>;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne({ _id: new ObjectID(args.id) }, { $set: args.data });
  }

  public async findOneById(id: ObjectID): Promise<Profile> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .findOne({ _id: new ObjectID(id) });
  }

  public async findNear(args: {
    coordinates: [number, number];
    maxDistance: number;
    minDistance?: number;
    filters?: any;
  }): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .find({
        ...args.filters,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: args.coordinates },
            $minDistance: args.minDistance || 0,
            $maxDistance: args.maxDistance,
          },
        },
      })
      .toArray();
  }
}

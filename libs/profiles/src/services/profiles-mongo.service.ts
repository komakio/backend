import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { Profile } from '../profile.model';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';
import { ConfigService } from '@backend/config';

@Injectable()
export class ProfilesMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}
  private collection = 'profiles';

  public onApplicationBootstrap() {
    this.mongo.addIndex(this.collection, { userId: 1 });
    this.mongo.addIndex(this.collection, { role: 1 });
    this.mongo.addIndex(this.collection, { country: 1 });
    this.mongo.addIndex(this.collection, { disabled: 1 });
    this.mongo.addIndex(this.collection, { 'address.location': '2dsphere' });
  }

  public async createOne(profile: Partial<Profile>): Promise<Profile> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(this.collection)
      .insertOne({ ...profile, createdAt: new Date() });
    return req.ops[0];
  }

  public async patchOneById(args: {
    id: ObjectID;
    data: Partial<Profile>;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .updateOne(
        { _id: new ObjectID(args.id) },
        { $set: { ...args.data, updatedAt: new Date() } }
      );
  }

  public async findOneById(id: ObjectID): Promise<Profile> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .findOne({ _id: new ObjectID(id) });
  }

  public async findAllByUserId(userId: ObjectID): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .find({ userId: new ObjectID(userId) })
      .toArray();
  }

  public async findManyById(args: {
    ids: ObjectID[];
    skip?: number;
    limit?: number;
  }): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .find({ _id: { $in: args.ids } })
      .skip(args.skip || 0)
      .limit(args.limit || 0)
      .toArray();
  }

  public async findNear(args: {
    coordinates: [number, number];
    maxDistance?: number;
    minDistance?: number;
    filters?: any;
    skip?: number;
    limit?: number;
  }): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .find({
        ...args.filters,
        'address.location': {
          $near: {
            $geometry: { type: 'Point', coordinates: args.coordinates },
            $minDistance: args.minDistance || 0,
            $maxDistance: args.maxDistance || this.config.maxDistance,
          },
        },
      })
      .skip(args.skip || 0)
      .limit(args.limit || 10)
      .toArray();
  }
}

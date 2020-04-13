import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { Profile, ProfileStatistics } from '../profile.model';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';
import { ConfigService } from '@backend/config';

const collection = 'profiles';
@Injectable()
export class ProfilesMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { userId: 1 });
    this.mongo.addIndex(collection, { role: 1 });
    this.mongo.addIndex(collection, { country: 1 });
    this.mongo.addIndex(collection, { disabled: 1 });
    this.mongo.addIndex(collection, { 'address.location': '2dsphere' });
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
      .updateOne(
        { _id: new ObjectID(args.id) },
        { $set: { ...args.data, updatedAt: new Date() } }
      );
  }

  public async findOneById(id: ObjectID): Promise<Profile> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .findOne({ _id: new ObjectID(id) });
  }

  public async findAllByUserId(userId: ObjectID): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .find({ userId: new ObjectID(userId) })
      .toArray();
  }

  public async getCounts(): Promise<ProfileStatistics> {
    await this.mongo.waitReady();

    const pipelines: object[] = [
      {
        $facet: {
          needers: [
            {
              $match: {
                role: 'helper',
              },
            },
            {
              $count: 'count',
            },
          ],
          helpers: [
            {
              $match: {
                role: 'needer',
              },
            },
            {
              $count: 'count',
            },
          ],
        },
      },
      {
        $project: {
          needers: {
            $arrayElemAt: ['$needers.count', 0.0],
          },
          helpers: {
            $arrayElemAt: ['$helpers.count', 0.0],
          },
        },
      },
    ];

    const res = await this.mongo.db
      .collection(collection)
      .aggregate(pipelines)
      .toArray();
    return res?.[0];
  }

  public async findManyById(args: {
    ids: ObjectID[];
    skip?: number;
    limit?: number;
  }): Promise<Profile[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
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
      .collection(collection)
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

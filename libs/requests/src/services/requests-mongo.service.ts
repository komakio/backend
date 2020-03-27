import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { HelpRequest } from '../requests.model';
import { UpdateWriteOpResult, ObjectID } from 'mongodb';
import { Location } from '@backend/profiles/profile.model';
import { ConfigService } from '@backend/config';

const collection = 'requests';
@Injectable()
export class RequestsMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { status: 1 });
    this.mongo.addIndex(collection, { createdAt: 1 });
    this.mongo.addIndex(collection, { location: '2dsphere' });
  }

  public async createOne(request: Partial<HelpRequest>): Promise<HelpRequest> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...request, createdAt: new Date() });
    return req.ops[0];
  }

  public async findOneById(id: ObjectID): Promise<HelpRequest> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .findOne({ _id: new ObjectID(id) });
  }

  public async findManyNear(args: {
    coordinates: Location['coordinates'];
    filters?: any;
    minDistance?: number;
    maxDistance?: number;
    skip?: number;
    limit?: number;
  }): Promise<HelpRequest[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .find({
        ...args.filters,
        location: {
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

  public async findManyBy(args: {
    filters: any;
    orderBy?: { [key: string]: 1 | -1 };
    skip?: number;
    limit?: number;
  }): Promise<HelpRequest[]> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .find(args.filters)
      .sort(args.orderBy)
      .skip(args.skip || 0)
      .limit(args.limit || 10)
      .toArray();
  }

  public async findOneBy(filters: any): Promise<HelpRequest> {
    await this.mongo.waitReady();
    return this.mongo.db.collection(collection).findOne(filters);
  }

  public async patchOneById(args: {
    id: ObjectID;
    filters?: any;
    data: Partial<HelpRequest>;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne(
        { _id: new ObjectID(args.id), ...args.filters },
        { $set: { ...args.data, updatedAt: new Date() } }
      );
  }

  public async pushToProfileIds(args: {
    id: ObjectID;
    profileId: ObjectID;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne(
        { _id: new ObjectID(args.id) },
        { $push: { profileIds: new ObjectID(args.profileId) } }
      );
  }

  public async pullFromProfileIds(args: {
    id: ObjectID;
    profileId: ObjectID;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne(
        { _id: new ObjectID(args.id) },
        { $pull: { profileIds: new ObjectID(args.profileId) } }
      );
  }
}

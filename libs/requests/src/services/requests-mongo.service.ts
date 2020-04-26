import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import {
  HelpRequest,
  RequestsStatistics,
  HelpRequestStatusEnum,
} from '../requests.model';
import { UpdateWriteOpResult, ObjectID } from 'mongodb';
import { Location } from '@backend/profiles/profiles.model';
import { ConfigService } from '@backend/config';

@Injectable()
export class RequestsMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}
  private collection = 'requests';

  public onApplicationBootstrap() {
    this.mongo.addIndex(this.collection, { status: 1 });
    this.mongo.addIndex(this.collection, { createdAt: 1 });
    this.mongo.addIndex(this.collection, { location: '2dsphere' });
  }

  public async createOne(request: Partial<HelpRequest>): Promise<HelpRequest> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(this.collection)
      .insertOne({ ...request, createdAt: new Date() });
    return req.ops[0];
  }

  public async findOneById(id: ObjectID): Promise<HelpRequest> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
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
      .collection(this.collection)
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
      .collection(this.collection)
      .find(args.filters)
      .sort(args.orderBy)
      .skip(args.skip || 0)
      .limit(args.limit || 10)
      .toArray();
  }

  public async findOneBy(filters: any): Promise<HelpRequest> {
    await this.mongo.waitReady();
    return this.mongo.db.collection(this.collection).findOne(filters);
  }

  public async patchOneById(args: {
    id: ObjectID;
    filters?: any;
    data: Partial<HelpRequest>;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .updateOne(
        { _id: new ObjectID(args.id), ...args.filters },
        { $set: { ...args.data, updatedAt: new Date() } }
      );
  }

  public async pushToCandidates(args: {
    id: ObjectID;
    profileId: ObjectID;
    distance: number;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db.collection(this.collection).updateOne(
      { _id: new ObjectID(args.id) },
      {
        $push: {
          candidates: {
            profileId: new ObjectID(args.profileId),
            distance: args.distance,
          },
        },
      }
    );
  }

  public async pullFromCandidates(args: {
    id: ObjectID;
    profileId: ObjectID;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(this.collection)
      .updateOne(
        { _id: new ObjectID(args.id) },
        { $pull: { candidates: { profileId: new ObjectID(args.profileId) } } }
      );
  }

  public async getStats(): Promise<RequestsStatistics> {
    await this.mongo.waitReady();

    const pipelines: object[] = [
      {
        $facet: {
          pending: [
            {
              $match: {
                status: HelpRequestStatusEnum.Pending,
              },
            },
            {
              $count: 'count',
            },
          ],
          accepted: [
            {
              $match: {
                status: HelpRequestStatusEnum.Accepted,
              },
            },
            {
              $count: 'count',
            },
          ],
          canceled: [
            {
              $match: {
                status: HelpRequestStatusEnum.Canceled,
              },
            },
            {
              $count: 'count',
            },
          ],
          used: [
            {
              $match: {
                status: HelpRequestStatusEnum.Used,
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
          pending: {
            $arrayElemAt: ['$pending.count', 0.0],
          },
          accepted: {
            $arrayElemAt: ['$accepted.count', 0.0],
          },
          canceled: {
            $arrayElemAt: ['$canceled.count', 0.0],
          },
          used: {
            $arrayElemAt: ['$used.count', 0.0],
          },
        },
      },
    ];

    const res = await this.mongo.db
      .collection(this.collection)
      .aggregate(pipelines)
      .toArray();
    return res?.[0];
  }
}

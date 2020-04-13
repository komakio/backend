import { Injectable } from '@nestjs/common';
import { User, SocialAuthTypeEnum, UsersStatistics } from '../users.model';
import { ObjectID } from 'mongodb';
import { MongoService } from '@backend/mongo';

@Injectable()
export class UsersMongoService {
  constructor(private mongo: MongoService) {}
  private collection = 'user';

  public onApplicationBootstrap() {
    this.mongo.addIndex(this.collection, { SocialAuthType: 1 });
    this.mongo.addIndex(this.collection, { authId: 1 });
  }

  public async createOne(user: Partial<User>): Promise<User> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(this.collection)
      .insertOne({ ...user, createdAt: new Date() });
    return new User(req.ops[0]);
  }

  public async findOneById(id: ObjectID): Promise<User> {
    const user = await this.mongo.db
      .collection(this.collection)
      .findOne({ _id: new ObjectID(id) });
    return user ? new User(user) : null;
  }

  public async findManyByIds(ids: ObjectID[]): Promise<User[]> {
    return this.mongo.db
      .collection(this.collection)
      .find({ _id: { $in: ids } })
      .toArray();
  }

  public async findOneBy(filters: any): Promise<User> {
    const user = await this.mongo.db
      .collection(this.collection)
      .findOne(filters);
    return user ? new User(user) : null;
  }

  public async patchOneById(args: {
    id: ObjectID;
    set: Partial<User>;
    unset: Partial<User>;
  }) {
    await this.mongo.waitReady();
    const query: any = {};
    if (args.set) {
      query.$set = { ...args.set, updatedAt: new Date() };
    }
    if (args.unset) {
      query.$unset = { ...args.unset, updatedAt: new Date() };
    }
    return this.mongo.db
      .collection(this.collection)
      .updateOne({ _id: new ObjectID(args.id) }, { ...query });
  }

  public async findOneBySocialAuth(args: {
    socialAuthId: string;
    socialAuthType: SocialAuthTypeEnum;
  }): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db.collection(this.collection).findOne({
      socialAuthType: args.socialAuthType,
      socialAuthId: args.socialAuthId,
    });
    return user ? new User(user) : null;
  }

  public async findOneByUsername(username: string): Promise<User> {
    await this.mongo.waitReady();
    const user = await this.mongo.db
      .collection(this.collection)
      .findOne({ username });
    return user ? new User(user) : null;
  }

  public async getStats(): Promise<UsersStatistics> {
    await this.mongo.waitReady();

    const pipelines: object[] = [
      {
        $facet: {
          apple: [
            {
              $match: {
                socialAuthType: SocialAuthTypeEnum.Apple,
              },
            },
            {
              $count: 'count',
            },
          ],
          google: [
            {
              $match: {
                socialAuthType: SocialAuthTypeEnum.Google,
              },
            },
            {
              $count: 'count',
            },
          ],
          regular: [
            {
              $match: {
                username: { $exists: true },
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
          apple: {
            $arrayElemAt: ['$apple.count', 0.0],
          },
          google: {
            $arrayElemAt: ['$google.count', 0.0],
          },
          regular: {
            $arrayElemAt: ['$regular.count', 0.0],
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

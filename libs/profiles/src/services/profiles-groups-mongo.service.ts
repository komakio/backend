import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { Profile } from '../profile.model';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';
import { ConfigService } from '@backend/config';

const collection = 'groups';
@Injectable()
export class ProfilesGroupsMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { userId: 1 });
  }

  public async createOne(profile: Partial<Profile>): Promise<Profile> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...profile, createdAt: new Date() });
    return req.ops[0];
  }
}

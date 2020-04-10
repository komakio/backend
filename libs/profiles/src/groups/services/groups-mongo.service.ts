import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { ConfigService } from '@backend/config';
import { Group } from '../groups.model';

const collection = 'groups';
@Injectable()
export class GroupsMongoService {
  constructor(private mongo: MongoService, private config: ConfigService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { managerUserId: 1 });
    this.mongo.addIndex(collection, { managerUserId: 1 });
  }

  public async createOne(group: Partial<Group>): Promise<Group> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...group, createdAt: new Date() });
    return new Group(req.ops[0]);
  }

  public async findOneBy(filters: Partial<Group>): Promise<Group> {
    await this.mongo.waitReady();
    const res = await this.mongo.db.collection(collection).findOne(filters);
    return res ? new Group(res) : null;
  }
}

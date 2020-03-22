import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { HelpRequest } from '../requests.model';
import { UpdateWriteOpResult, ObjectID } from 'mongodb';

const collection = 'requests';
@Injectable()
export class RequestsMongoService {
  constructor(private mongo: MongoService) {}

  public onApplicationBootstrap() {
    this.mongo.addIndex(collection, { status: 1 });
    this.mongo.addIndex(collection, { createdAt: 1 });
  }

  public async createOne(request: Partial<HelpRequest>): Promise<HelpRequest> {
    await this.mongo.waitReady();
    const req = await this.mongo.db
      .collection(collection)
      .insertOne({ ...request, createdAt: new Date() });
    return req.ops[0];
  }

  public async patchOne(args: {
    id: ObjectID;
    userId: ObjectID;
    data: Partial<HelpRequest>;
  }): Promise<UpdateWriteOpResult> {
    await this.mongo.waitReady();
    return this.mongo.db
      .collection(collection)
      .updateOne(
        { _id: new ObjectID(args.id), userId: new ObjectID(args.userId) },
        { $set: args.data }
      );
  }
}

import { Injectable } from '@nestjs/common';
import { MongoService } from '@backend/mongo';
import { HelpRequest } from '../requests.model';

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
}

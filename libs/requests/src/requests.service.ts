import { Injectable } from '@nestjs/common';
import { RequestsMongoService } from './services/requests-mongo.service';
import { HelpRequest } from './requests.model';
import { ObjectID } from 'mongodb';

@Injectable()
export class RequestsService {
  constructor(private requestsMongo: RequestsMongoService) {}

  public async createOne(request: Partial<HelpRequest>) {
    return this.requestsMongo.createOne(request);
  }

  public async cancelOne(args: { id: ObjectID; userId: ObjectID }) {
    return this.requestsMongo.patchOne({
      id: new ObjectID(args.id),
      userId: new ObjectID(args.userId),
      data: { status: 'canceled', userIds: [] },
    });
  }
}

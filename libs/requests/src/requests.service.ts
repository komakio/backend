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

  public async cancelOne(args: {
    id: ObjectID;
    request: Partial<HelpRequest>;
  }) {
    return this.requestsMongo.patchOne({
      id: args.id,
      data: { status: 'canceled' },
    });
  }
}

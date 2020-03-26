import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RequestsMongoService } from './services/requests-mongo.service';
import { HelpRequest } from './requests.model';
import { ObjectID } from 'mongodb';

@Injectable()
export class RequestsService {
  constructor(private requestsMongo: RequestsMongoService) {}

  public async createOne(request: Partial<HelpRequest>) {
    return this.requestsMongo.createOne(request);
  }

  public async findOneById(id: ObjectID) {
    return this.requestsMongo.findOneById(new ObjectID(id));
  }

  public async findAllByProfileId(profileId: ObjectID) {
    return this.requestsMongo.findManyBy({
      $or: [
        {
          profileIds: new ObjectID(profileId),
        },
        { acceptorProfileId: new ObjectID(profileId) },
        { requesterProfileId: new ObjectID(profileId) },
      ],
    });
  }

  public async cancelOne(id: ObjectID) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(id),
      data: { status: 'canceled', profileIds: [] },
    });
  }

  public async acceptOne(args: { id: ObjectID; acceptorProfileId: ObjectID }) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: {
        status: 'accepted',
        acceptorProfileId: new ObjectID(args.acceptorProfileId),
        profileIds: [],
      },
    });
  }

  public async patchOne(args: { id: ObjectID; data: Partial<HelpRequest> }) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async validateRequestResponseMatch(args: {
    id: ObjectID;
    responseProfileId: ObjectID;
  }) {
    const request = await this.requestsMongo.findOneById(new ObjectID(args.id));
    if (!request.profileIds.find(id => id.equals(args.responseProfileId))) {
      throw new HttpException(
        'REQUEST_RESPONSE_MISMATCH',
        HttpStatus.FORBIDDEN
      );
    }
  }
}

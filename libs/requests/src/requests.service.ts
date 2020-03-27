import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RequestsMongoService } from './services/requests-mongo.service';
import { HelpRequest } from './requests.model';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '@backend/profiles';
import { NotificationsService } from '@backend/notifications';
import { UsersService } from '@backend/users';

@Injectable()
export class RequestsService {
  constructor(
    private requestsMongo: RequestsMongoService,
    private profiles: ProfilesService,
    private users: UsersService,
    private notifications: NotificationsService
  ) {}

  public async createOne(request: Partial<HelpRequest>) {
    return this.requestsMongo.createOne(request);
  }

  public async findOneById(id: ObjectID) {
    return this.requestsMongo.findOneById(new ObjectID(id));
  }

  public async findAllNewestByProfileId(args: {
    profileId: ObjectID;
    skip?: number;
    limit?: number;
  }) {
    return this.requestsMongo.findManyBy({
      filters: {
        $or: [
          {
            profileIds: new ObjectID(args.profileId),
          },
          { acceptorProfileId: new ObjectID(args.profileId) },
          { requesterProfileId: new ObjectID(args.profileId) },
        ],
      },
      orderBy: { _id: -1 },
      skip: args.skip,
      limit: args.limit,
    });
  }

  public async cancelOne(id: ObjectID) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(id),
      data: { status: 'canceled', profileIds: [] },
    });
  }

  public async acceptOne(args: { id: ObjectID; acceptorProfileId: ObjectID }) {
    const profile = await this.profiles.findOneById(args.acceptorProfileId);
    await this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: {
        status: 'accepted',
        acceptorProfileId: new ObjectID(args.acceptorProfileId),
        profileIds: [],
        acceptorShortName: profile.firstName,
      },
    });
    const request = await this.findOneById(new ObjectID(args.id));
    const requesterProfile = await this.profiles.findOneById(
      new ObjectID(request.requesterProfileId)
    );
    const requesterUser = await this.users.findOneById(
      new ObjectID(requesterProfile.userId)
    );
    const registrationToken =
      requesterUser.uuidRegTokenPair &&
      Object.values(requesterUser.uuidRegTokenPair)?.[0];

    if (!registrationToken) {
      return;
    }

    await this.notifications.send({
      registrationTokens: [registrationToken],
      message: {
        title: 'KOMAK',
        body: 'Someone accepted you request.',
        icon: '',
      },
    });
  }

  public async refuseOne(args: { id: ObjectID; refuserProfileId: ObjectID }) {
    return this.requestsMongo.pullFromProfileIds({
      profileId: new ObjectID(args.refuserProfileId),
      id: new ObjectID(args.id),
    });
  }

  public async patchOne(args: { id: ObjectID; data: Partial<HelpRequest> }) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async subscribeToRequests(args: {
    profileId: ObjectID;
    registrationToken: string;
  }) {
    const profile = await this.profiles.findOneById(
      new ObjectID(args.profileId)
    );
    const requests = await this.requestsMongo.findManyNear({
      coordinates: profile?.address?.location?.coordinates,
    });

    const promises = requests.slice(3).map(async r => {
      await this.requestsMongo.pushToProfileIds({
        profileId: new ObjectID(args.profileId),
        id: new ObjectID(r._id),
      });
      await this.notifications.send({
        registrationTokens: [args.registrationToken],
        message: {
          title: 'KOMAK',
          body: 'Someone is in need of your help.',
          icon: '',
        },
        payload: {
          requestId: r._id?.toString(),
        },
      });
    });
    await Promise.all(promises);
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

  public async findRequestProfilesDetailsById(args: {
    id: ObjectID;
    profileId: ObjectID;
  }) {
    const request = await this.findOneById(new ObjectID(args.id));
    if (
      request.status !== 'accepted' ||
      (!request.acceptorProfileId.equals(args.profileId) &&
        !request.requesterProfileId.equals(args.profileId))
    ) {
      throw new HttpException('FORBIDDEN_REQUEST', HttpStatus.FORBIDDEN);
    }
    const profiles = await this.profiles.findManyById({
      ids: [request.acceptorProfileId, request.requesterProfileId],
    });
    return profiles;
  }
}

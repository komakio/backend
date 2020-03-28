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
      data: { status: 'canceled', candidates: [] },
    });
  }

  public async acceptOne(args: { id: ObjectID; acceptorProfileId: ObjectID }) {
    const profile = await this.profiles.findOneById(args.acceptorProfileId);
    await this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: {
        status: 'accepted',
        acceptorProfileId: new ObjectID(args.acceptorProfileId),
        candidates: [],
        acceptorShortName: profile.firstName,
      },
    });
    const request = await this.findOneById(new ObjectID(args.id));
    const requesterProfile = await this.profiles.findOneById(
      new ObjectID(request.requesterProfileId)
    );
    const user = await this.users.findOneById(
      new ObjectID(requesterProfile.userId)
    );
    const registrationTokens = Object.values(user.uuidRegTokenPair || {});

    await this.notifications.send({
      registrationTokens,
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

  public async finishOne(args: { id: ObjectID; profileId: ObjectID }) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: { status: 'used' },
    });
  }

  public async patchOne(args: { id: ObjectID; data: Partial<HelpRequest> }) {
    return this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async dispatchRequest(args: {
    requestId: ObjectID;
    profileId: ObjectID;
  }) {
    const profilesWithDistance = await this.profiles.findNearHelpersById(
      new ObjectID(args.profileId)
    );

    const users = await this.users.findManyByIds(
      profilesWithDistance.map(p => new ObjectID(p.userId))
    );

    const registrationTokens = users?.reduce((total, u) => {
      const tokens = Object.values(u.uuidRegTokenPair || {});
      return [...total, ...tokens];
    }, []);

    await this.patchOne({
      id: new ObjectID(args.requestId),
      data: {
        candidates: profilesWithDistance?.map(p => ({
          profileId: p._id,
          distance: p.distance,
        })),
      },
    });

    const request = await this.findOneById(args.requestId);

    await this.notifications.send({
      registrationTokens,
      message: {
        title: 'KOMAK',
        body: 'Someone is in need of your help.',
        icon: '',
      },
      payload: {
        request: JSON.stringify(request),
      },
    });
  }

  public async subscribeToRequests(args: {
    profileId: ObjectID;
    registrationTokens: string[];
  }) {
    const profile = await this.profiles.findOneById(
      new ObjectID(args.profileId)
    );
    const requests = await this.requestsMongo.findManyNear({
      coordinates: profile?.address?.location?.coordinates,
    });

    const promises = requests?.slice(3).map(async r => {
      await this.requestsMongo.pushToProfileIds({
        profileId: new ObjectID(args.profileId),
        id: new ObjectID(r._id),
      });
      await this.notifications.send({
        registrationTokens: args.registrationTokens,
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
    if (
      !request.candidates.find(({ profileId }) =>
        profileId.equals(args.responseProfileId)
      )
    ) {
      throw new HttpException(
        'REQUEST_RESPONSE_MISMATCH',
        HttpStatus.FORBIDDEN
      );
    }
  }

  public async validateRequestProfileIdMatch(args: {
    id: ObjectID;
    profileId: ObjectID;
  }) {
    const request = await this.requestsMongo.findOneBy({
      $or: [
        { acceptorProfileId: new ObjectID(args.profileId) },
        { requesterProfileId: new ObjectID(args.profileId) },
      ],
    });
    if (!request) {
      throw new HttpException('FORBIDDEN_PROFILE_ID', HttpStatus.FORBIDDEN);
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

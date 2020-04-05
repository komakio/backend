import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RequestsMongoService } from './services/requests-mongo.service';
import { HelpRequest } from './requests.model';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '@backend/profiles';
import { NotificationsService } from '@backend/notifications';
import { UsersService } from '@backend/users';
import { ConfigService } from '@backend/config';
import { getDistance } from '@utils/distance';
import { RequestsRabbitMQService } from './services/requests-rabbitmq.service';
import { EmailService } from '@backend/email';

@Injectable()
export class RequestsService {
  constructor(
    private requestsMongo: RequestsMongoService,
    private profiles: ProfilesService,
    private users: UsersService,
    private notifications: NotificationsService,
    private config: ConfigService,
    private requestsRabbitMQ: RequestsRabbitMQService,
    private email: EmailService
  ) {}

  public async createOne(profileId: ObjectID) {
    const profile = await this.profiles.findOneById(new ObjectID(profileId));
    const request = await this.requestsMongo.createOne({
      requesterShortName: profile.firstName,
      location: profile?.address?.location,
      status: 'pending',
      requesterProfileId: new ObjectID(profileId),
      type: 'misc',
    });
    await this.requestsRabbitMQ.sendToDispatchRequests({
      profileId: new ObjectID(profileId),
      requestId: new ObjectID(request._id),
    });
    return request;
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
            candidates: {
              $elemMatch: { profileId: new ObjectID(args.profileId) },
            },
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
    const request = await this.findOneById(new ObjectID(args.id));

    await this.requestsMongo.patchOneById({
      id: new ObjectID(args.id),
      data: {
        status: 'accepted',
        acceptorProfileId: new ObjectID(args.acceptorProfileId),
        acceptorDistance: request.candidates.find(c =>
          c.profileId.equals(args.acceptorProfileId)
        )?.distance,
        candidates: [],
        acceptorShortName: profile.firstName,
      },
    });

    const requesterProfile = await this.profiles.findOneById(
      new ObjectID(request.requesterProfileId)
    );

    if (requesterProfile.communicateBy === 'email') {
      await this.email.send(
        requesterProfile.email,
        'Someone accepted your request (KOMAK.IO)',
        `${profile.firstName} ${profile.lastName} has accepted to help you. this is the volunteer's phone number: ${profile.phone}.`
      );
    }

    const user = await this.users.findOneById(
      new ObjectID(requesterProfile.userId)
    );
    const registrationTokens = Object.values(user.uuidRegTokenPair || {});

    //todo: webform
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
    return this.requestsMongo.pullFromCandidates({
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
    const profilesWithDistance = await this.profiles.findNearHelpersWithDistanceById(
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
      filters: { status: 'pending' },
      coordinates: profile?.address?.location?.coordinates,
    });

    const promises = requests?.slice(0, 3).map(async r => {
      const distance = getDistance({
        from: r?.location?.coordinates,
        to: profile?.address?.location?.coordinates,
      });
      if (distance > (profile.coverage || this.config.maxDistance)) {
        return;
      }
      await this.requestsMongo.pushToCandidates({
        profileId: new ObjectID(args.profileId),
        distance,
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

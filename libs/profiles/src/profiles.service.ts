import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ProfilesMongoService } from './services/profiles-mongo.service';
import { Profile } from './profiles.model';
import { ObjectID } from 'mongodb';
import { getDistance } from '@utils/distance';
import { ConfigService } from '@backend/config';
import { GroupsService } from '@backend/groups';

@Injectable()
export class ProfilesService {
  constructor(
    private profilesMongo: ProfilesMongoService,
    private config: ConfigService,
    private groups: GroupsService
  ) {}

  public async create(profile: Partial<Profile>) {
    return this.profilesMongo.createOne(profile);
  }

  public async validateProfileUserMatch(args: {
    id: ObjectID;
    userId: ObjectID;
  }) {
    const profile = await this.profilesMongo.findOneById(new ObjectID(args.id));
    if (!profile?.userId.equals(args.userId)) {
      throw new HttpException('USER_PROFILE_MISMATCH', HttpStatus.FORBIDDEN);
    }
  }

  public async findOneById(id: ObjectID): Promise<Profile> {
    return this.profilesMongo.findOneById(new ObjectID(id));
  }

  public async findAllAggregatedWithGroupByUserId(userId: ObjectID) {
    return this.profilesMongo.findAllAggregatedWithGroupBy({
      userId: new ObjectID(userId),
    });
  }

  public async findAggregatedWithGroupById(id: ObjectID) {
    const res = await this.profilesMongo.findAllAggregatedWithGroupBy({
      _id: new ObjectID(id),
    });
    return res[0];
  }

  public async findManyById(args: {
    ids: ObjectID[];
    skip?: number;
    limit?: number;
  }) {
    return this.profilesMongo.findManyById({
      ids: args.ids,
      skip: args.skip,
      limit: args.limit,
    });
  }

  public async patchOneById(args: { id: ObjectID; data: Partial<Profile> }) {
    return this.profilesMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async findNearHelpersWithDistanceById(
    id: ObjectID
  ): Promise<Array<Profile & { distance: number }>> {
    const { address } = await this.profilesMongo.findOneById(new ObjectID(id));
    if (!address?.location?.coordinates) {
      return [];
    }

    const profiles = (
      await this.profilesMongo.findNear({
        filters: {
          disabled: { $ne: true },
        },
        coordinates: address.location.coordinates,
        limit: 500,
      })
    ).filter(p => !p._id.equals(id));

    return profiles
      .map(p => ({
        ...p,
        distance: getDistance({
          from: p.address.location.coordinates,
          to: address.location.coordinates,
        }),
      }))
      .filter(p => p.distance <= (p.coverage || this.config.maxDistance));
  }

  public async addOneToGroup(args: {
    profileId: ObjectID;
    groupSecret: string;
  }) {
    const group = await this.groups.findOneBySecret(args.groupSecret);
    if (!group) {
      throw new HttpException('INVALID_SECRET', HttpStatus.FORBIDDEN);
    }
    await this.patchOneById({
      id: new ObjectID(args.profileId),
      data: { groupId: new ObjectID(group._id) },
    });
    return group;
  }

  public async getStats() {
    const stats = await this.profilesMongo.getStats();
    return {
      helpers: stats.helpers || 0,
      needer: stats.needers || 0,
      total: (stats.helpers || 0) + (stats.needers || 0),
    };
  }
}

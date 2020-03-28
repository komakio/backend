import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { Profile } from './profile.model';
import { ObjectID } from 'mongodb';
import { getDistance } from 'utils/distance';

@Injectable()
export class ProfilesService {
  constructor(private profilesMongo: ProfilesMongoService) {}

  public async create(profile: Partial<Profile>) {
    return this.profilesMongo.createOne(profile);
  }

  public async validateProfileUserMatch(args: {
    id: ObjectID;
    userId: ObjectID;
  }) {
    const profile = await this.profilesMongo.findOneById(new ObjectID(args.id));
    if (!profile.userId.equals(args.userId)) {
      throw new HttpException('USER_PROFILE_MISMATCH', HttpStatus.FORBIDDEN);
    }
  }

  public async findOneById(id: ObjectID) {
    return this.profilesMongo.findOneById(new ObjectID(id));
  }

  public async findAllByUserId(userId: ObjectID) {
    return this.profilesMongo.findAllByUserId(new ObjectID(userId));
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

  public async findNearHelpersById(
    id: ObjectID
  ): Promise<Array<Profile & { distance: number }>> {
    const { address } = await this.profilesMongo.findOneById(new ObjectID(id));
    if (!address?.location?.coordinates) {
      return [];
    }

    const profiles = (
      await this.profilesMongo.findNear({
        filters: {
          role: 'helper',
          disabled: { $ne: true },
        },
        coordinates: address.location.coordinates,
      })
    ).filter(p => !p._id.equals(id));

    profiles
      .map(p => ({
        ...p,
        distance: getDistance({
          from: p.address.location.coordinates,
          to: address.location.coordinates,
        }),
      }))
      .filter(p => p.distance <= p.coverage);
  }
}

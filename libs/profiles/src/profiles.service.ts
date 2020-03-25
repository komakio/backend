import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { Profile } from './profile.model';
import { ObjectID } from 'mongodb';

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

  public async findNearHelpers(args: { id: ObjectID; maxDistance: number }) {
    const { address } = await this.profilesMongo.findOneById(
      new ObjectID(args.id)
    );
    const near = await this.profilesMongo.findNear({
      filters: {
        role: 'helper',
        disabled: false,
      },
      coordinates: address.location.coordinates,
      maxDistance: args.maxDistance,
    });
    return near.filter(n => !n._id.equals(args.id));
  }
}

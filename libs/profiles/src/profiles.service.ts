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
    if (profile.userId !== new ObjectID(args.userId)) {
      throw new HttpException('USER_PROFILE_MISMATCH', HttpStatus.FORBIDDEN);
    }
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
    return this.profilesMongo.findNear({
      filters: {
        role: 'helper',
        disabled: false,
        'address.country': address.country,
      },
      coordinates: address.location.coordinates,
      maxDistance: args.maxDistance,
    });
  }
}

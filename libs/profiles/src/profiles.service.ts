import { Injectable } from '@nestjs/common';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { Profile } from './profile.model';
import { ObjectID } from 'mongodb';

@Injectable()
export class ProfilesService {
  constructor(private profilesMongo: ProfilesMongoService) {}

  public async create(profile: Partial<Profile>) {
    return this.profilesMongo.createOne(profile);
  }

  public async patchOneById(args: { id: ObjectID; data: Partial<Profile> }) {
    return this.profilesMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async findNearHelpers(args: { id: ObjectID; maxDistance: number }) {
    const { location } = await this.profilesMongo.findOneById(
      new ObjectID(args.id)
    );
    return this.profilesMongo.findNear({
      filters: {
        role: 'helper',
        disabled: false,
        'location.country': location.country,
      },
      coordinates: location.geo.coordinates,
      maxDistance: args.maxDistance,
    });
  }
}

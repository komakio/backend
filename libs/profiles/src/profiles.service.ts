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
        return this.profilesMongo.patchOneById({ id: new ObjectID(args.id), data: args.data });
    }
}

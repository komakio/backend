import { Injectable } from '@nestjs/common';
import { MongoService } from '@mongo/mongo';
import { Profile } from '../profile.model';
import { ObjectID, UpdateWriteOpResult } from 'mongodb';

const collection = 'profiles';
@Injectable()
export class ProfilesMongoService {
    constructor(private mongo: MongoService) {}

    public onApplicationBootstrap() {
        this.mongo.addIndex(collection, { uuid: 1 });
    }

    public async createOne(profile: Partial<Profile>): Promise<Profile> {
        await this.mongo.waitReady();
        const req = await this.mongo.db.collection(collection).insertOne({ ...profile, createdAt: new Date() });
        return req.ops[0];
    }

    public async patchOneById(args: { id: ObjectID; data: Partial<Profile> }): Promise<UpdateWriteOpResult> {
        await this.mongo.waitReady();
        return this.mongo.db.collection(collection).updateOne({ _id: new ObjectID(args.id) }, { $set: args.data });
    }
}

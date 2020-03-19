import { Injectable } from '@nestjs/common';
import { MongoService } from 'src/mongo/mongo.service';
import { User } from '../users.model';
import { ObjectID } from 'mongodb';

const collection = 'users';
@Injectable()
export class UsersMongoService {
    constructor(private mongo: MongoService) {}

    public onApplicationBootstrap() {
        this.mongo.addIndex(collection, { uuid: 1 });
    }

    public async createOne(user: Partial<User>): Promise<User> {
        await this.mongo.waitReady();
        const req = await this.mongo.db.collection(collection).insertOne({ ...user, createdAt: new Date() });
        return new User(req.ops[0]);
    }

    public async patchOneById(args: { id: ObjectID; data: Partial<User> }) {
        await this.mongo.waitReady();
        return this.mongo.db
            .collection(collection)
            .updateOne({ _id: new ObjectID(args.id) }, args.data, { upsert: true });
    }

    public async findOneByUuid(uuid: string): Promise<User> {
        await this.mongo.waitReady();
        const user = await this.mongo.db.collection(collection).findOne({ uuid });
        return user ? new User(user) : null;
    }
}

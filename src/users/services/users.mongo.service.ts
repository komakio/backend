import { Injectable } from '@nestjs/common';
import { MongoService } from 'src/mongo/mongo.service';
import { User } from '../users.model';

const collection = 'users';
@Injectable()
export class UsersMongoService {
    constructor(private mongo: MongoService) {}

    public onApplicationBootstrap() {
        this.mongo.addIndex(collection, { uuid: 1 });
    }

    public async findOneByUuid(uuid: string) {
        await this.mongo.waitReady();
        return this.mongo.db.collection(collection).findOne({ uuid });
    }

    public async findOneByCredentials(credentials: { uuid: string; password: string }) {
        await this.mongo.waitReady();
        return this.mongo.db.collection(collection).findOne({ uuid: credentials.uuid, password: credentials.password });
    }

    public async createOne(user: Partial<User>) {
        await this.mongo.waitReady();
        const req = await this.mongo.db.collection(collection).insertOne({ ...user, createdAt: new Date() });
        return req.ops[0] as User;
    }
}

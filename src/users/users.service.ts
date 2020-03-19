import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto, PatchUserDto } from './users.controller';
import { compareHash, hashString } from 'src/utils/hash';
import { UsersMongoService } from './services/users.mongo.service';
import { ObjectID } from 'mongodb';

@Injectable()
export class UsersService {
    constructor(private usersMongo: UsersMongoService) {}

    public async login(data: LoginDto) {
        const user = await this.usersMongo.findOneByUuid(data.uuid);
        if (!user || !(await compareHash(data.password, user.password))) {
            throw new HttpException('BAD_CREDENTIALS', HttpStatus.FORBIDDEN);
        }
        return user;
    }

    public async register(data: LoginDto) {
        const user = await this.usersMongo.findOneByUuid(data.uuid);
        if (user) {
            throw new HttpException('EXISTING_USER', HttpStatus.FORBIDDEN);
        }
        const hashedPassword = await hashString(data.password);
        return this.usersMongo.createOne({ uuid: data.uuid, password: hashedPassword });
    }

    public async patch(args: { id: ObjectID; data: PatchUserDto }) {
        return this.usersMongo.patchOneById({ id: new ObjectID(args.id), data: args.data });
    }
}

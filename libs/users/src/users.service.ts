import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersMongoService } from './services/users.mongo.service';
import { ObjectID } from 'mongodb';
import { User } from './users.model';
import { AppleService } from './auth/services/apple.service';

@Injectable()
export class UsersService {
  constructor(
    private usersMongo: UsersMongoService,
    private apple: AppleService
  ) {}

  public async patch(args: { id: ObjectID; data: Partial<User> }) {
    return this.usersMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async appleLogin(identityToken: string) {
    const appleId = await this.apple.getAppleId(identityToken);
    if (!appleId) {
      throw new HttpException('INVALID_IDENTITY_TOKEN', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersMongo.findOneByAuthIdType({
      authId: appleId,
      authType: 'apple',
    });
    if (user) {
      return user;
    }

    return this.usersMongo.createOne({
      authType: 'apple',
      authId: appleId,
    });
  }
}

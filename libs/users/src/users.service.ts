import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersMongoService } from './services/users.mongo.service';
import { ObjectID } from 'mongodb';
import { User, AuthType } from './users.model';
import { AppleService } from './auth/services/apple.service';
import { GoogleService } from './auth/services/google.service';

@Injectable()
export class UsersService {
  constructor(
    private usersMongo: UsersMongoService,
    private apple: AppleService,
    private google: GoogleService
  ) {}

  public async patch(args: { id: ObjectID; data: Partial<User> }) {
    return this.usersMongo.patchOneById({
      id: new ObjectID(args.id),
      data: args.data,
    });
  }

  public async appleLogin(identityToken: string) {
    const authId = await this.apple.getAppleId(identityToken);
    return this.getUser({ authId, authType: 'apple' });
  }

  public async googleLogin(identityToken: string) {
    const authId = await this.google.getTicket(identityToken);
    return this.getUser({ authId, authType: 'google' });
  }

  public async findOneById(id: ObjectID) {
    return this.usersMongo.findOneById(id);
  }

  public async findManyByIds(ids: ObjectID[]) {
    return this.usersMongo.findManyByIds(ids);
  }

  private async getUser(args: { authId: string; authType: AuthType }) {
    if (!args.authId) {
      throw new HttpException('INVALID_IDENTITY_TOKEN', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersMongo.findOneByAuthIdType({
      authId: args.authId,
      authType: args.authType,
    });
    if (user) {
      return user;
    }

    return this.usersMongo.createOne({
      authType: args.authType,
      authId: args.authId,
    });
  }
}

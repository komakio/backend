import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersMongoService } from './services/users.mongo.service';
import { ObjectID } from 'mongodb';
import { User, SocialAuthType } from './users.model';
import { AppleService } from './auth/services/apple.service';
import { GoogleService } from './auth/services/google.service';
import { compareHash, hashString } from 'utils/hash';

@Injectable()
export class UsersService {
  constructor(
    private usersMongo: UsersMongoService,
    private apple: AppleService,
    private google: GoogleService
  ) {}

  public async patch(args: {
    id: ObjectID;
    set?: Partial<User>;
    unset?: Partial<User>;
  }) {
    return this.usersMongo.patchOneById({
      id: new ObjectID(args.id),
      set: args.set,
      unset: args.unset,
    });
  }

  public async appleLogin(identityToken: string) {
    const socialAuthId = await this.apple.getAppleId(identityToken);
    return this.getUser({ socialAuthId, socialAuthType: 'apple' });
  }

  public async googleLogin(identityToken: string) {
    const socialAuthId = await this.google.getTicket(identityToken);
    return this.getUser({ socialAuthId, socialAuthType: 'google' });
  }

  public async passwordLogin(args: { username: string; password: string }) {
    const user = await this.usersMongo.findOneByUsername(args.username);
    if (user) {
      if (!(await compareHash(args.password, user.password))) {
        throw new HttpException('BAD_CREDENTIALS', HttpStatus.FORBIDDEN);
      }
      return user;
    }
    const hashedPassword = await hashString(args.password);
    return this.usersMongo.createOne({
      username: args.username,
      password: hashedPassword,
    });
  }

  public async findOneById(id: ObjectID) {
    return this.usersMongo.findOneById(id);
  }

  public async findManyByIds(ids: ObjectID[]) {
    return this.usersMongo.findManyByIds(ids);
  }

  private async getUser(args: {
    socialAuthId: string;
    socialAuthType: SocialAuthType;
  }) {
    if (!args.socialAuthId) {
      throw new HttpException('INVALID_IDENTITY_TOKEN', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersMongo.findOneBySocialAuth({
      socialAuthType: args.socialAuthType,
      socialAuthId: args.socialAuthId,
    });
    if (user) {
      return user;
    }

    return this.usersMongo.createOne({
      socialAuthType: args.socialAuthType,
      socialAuthId: args.socialAuthId,
    });
  }
}

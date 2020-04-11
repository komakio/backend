import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersMongoService } from './services/users.mongo.service';
import { ObjectID } from 'mongodb';
import { User, SocialAuthTypeEnum } from './users.model';
import { AppleService } from './auth/services/apple.service';
import { GoogleService } from './auth/services/google.service';
import { compareHash, hashString } from '@utils/hash';
import { RecaptchaService } from './auth/services/captcha.service';

@Injectable()
export class UsersService {
  constructor(
    private usersMongo: UsersMongoService,
    private apple: AppleService,
    private google: GoogleService,
    private recaptcha: RecaptchaService
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
    return this.getSocialUser({
      socialAuthId,
      socialAuthType: SocialAuthTypeEnum.Apple,
    });
  }

  public async googleLogin(identityToken: string) {
    const socialAuthId = await this.google.getTicket(identityToken);
    return this.getSocialUser({
      socialAuthId,
      socialAuthType: SocialAuthTypeEnum.Google,
    });
  }

  public async recaptchaLogin(response: string) {
    const isValid = await this.recaptcha.validate(response);
    console.log({ isValid });

    if (!isValid) {
      throw new HttpException('INVALID_RECAPTCHA', HttpStatus.FORBIDDEN);
    }
    const user = await this.usersMongo.findOneBy({
      isAnonymous: { $exists: true },
    });

    if (user) {
      return user;
    }

    return this.usersMongo.createOne({
      isAnonymous: true,
    });
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

  private async getSocialUser(args: {
    socialAuthId: string;
    socialAuthType: SocialAuthTypeEnum;
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

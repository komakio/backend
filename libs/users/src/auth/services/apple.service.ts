import appleSignin from 'apple-signin-auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppleService {
  public async login(authorizationCode: string) {
    const result = await appleSignin.verifyIdToken(authorizationCode, {
      audience: 'io.komak.app', // SHOULD BE ENV VARIABLE
    });
    const appleId = result.sub;
    console.log(appleId);
  }
}

import appleSignin from 'apple-signin-auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppleService {
  public async login(identityToken: string) {
    const result = await appleSignin.verifyIdToken(identityToken, {
      audience: 'io.komak.app', // SHOULD BE ENV VARIABLE
    });
    const appleId = result.sub;
    console.log(appleId);
  }
}

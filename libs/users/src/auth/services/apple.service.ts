import * as appleSignin from 'apple-signin';
import { Injectable } from '@nestjs/common';

const clientId = 'io.komak.app';
const clientSecret = appleSignin.getClientSecret({
  clientID: clientId,
});

@Injectable()
export class AppleService {
  public async login(authorizationCode: string) {
    const tokens = await appleSignin.getAuthorizationToken(authorizationCode, {
      clientID: clientId,
      clientSecret,
      redirectUri: '/',
    });
    // tokens.access_token
    // tokens.id_token
  }
}

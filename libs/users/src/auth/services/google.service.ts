import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@backend/config';
const oAuth2Client = new OAuth2Client();

@Injectable()
export class GoogleService {
  constructor(private config: ConfigService) {}

  public async login(identityToken: string) {
    const ticket = await oAuth2Client.verifyIdToken({
      audience: this.config.fcm.googleProject,
      idToken: identityToken,
    });
    console.log(ticket);
  }
}

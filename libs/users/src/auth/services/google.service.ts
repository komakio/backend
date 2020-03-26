import { Injectable } from '@nestjs/common';
import { OAuth2Client, LoginTicket } from 'google-auth-library';
import { ConfigService } from '@backend/config';
const oAuth2Client = new OAuth2Client();

@Injectable()
export class GoogleService {
  constructor(private config: ConfigService) {}

  public async getTicket(identityToken: string) {
    let ticket: LoginTicket;
    try {
      ticket = await oAuth2Client.verifyIdToken({
        audience: [
          this.config.googleAuthProject.ios,
          this.config.googleAuthProject.android,
        ],
        idToken: identityToken,
      });
    } catch (e) {
      console.log(e);
    }
    return ticket?.getUserId();
  }
}

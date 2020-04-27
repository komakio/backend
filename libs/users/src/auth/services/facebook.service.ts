import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import Axios from 'axios';

@Injectable()
export class FacebookService {
  constructor(private config: ConfigService) {}

  public async verify(identityToken: string) {
    try {
      const { data } = await Axios.get(
        `graph.facebook.com/debug_token?input_token=${identityToken}&access_token=${this.config.facebook.secret}`
      );
      // ({
      //   url: 'https://graph.facebook.com/v4.0/oauth/access_token',
      //   method: 'get',
      //   params: {
      //     client_id: process.env.APP_ID_GOES_HERE, //config
      //     client_secret: process.env.APP_SECRET_GOES_HERE, //config
      //     redirect_uri: 'https://www.example.com/authenticate/facebook/',
      //     code: identityToken,
      //   },
      // });
      console.log(data); // { access_token, token_type, expires_in }
      return data.access_token;
    } catch (err) {} //error log
  }
}

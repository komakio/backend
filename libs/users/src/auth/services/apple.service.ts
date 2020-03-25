import appleSignin from 'apple-signin-auth';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';

@Injectable()
export class AppleService {
  constructor(private config: ConfigService) {}
  public async getAppleId(identityToken: string): Promise<string> {
    let appleId: string;
    try {
      const result = await appleSignin.verifyIdToken(identityToken, {
        audience: this.config.fcm.restrictedPackageName,
      });
      appleId = result.sub;
    } catch {
      return appleId;
    }
  }
}

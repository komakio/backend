import appleSignin from 'apple-signin-auth';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { resolveIfOneResolves } from '@utils/promise';

@Injectable()
export class AppleService {
  constructor(private config: ConfigService) {}
  public async getAppleId(identityToken: string): Promise<string> {
    let appleId: string;
    const promises = this.config.packageNames.map(async packageName => {
      const result = await appleSignin.verifyIdToken(identityToken, {
        audience: packageName,
      });
      appleId = result.sub;
      return appleId;
    });

    const res = await resolveIfOneResolves(promises);

    return res.find(p => p);
  }
}

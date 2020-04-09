import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import Axios from 'axios';
import AdmZip from 'adm-zip';
import { CrowdinLanguage, Translation } from './translations-model';
import { TranslationsRedisService } from './services/translations-redis.service';
import Crowdin, { Credentials } from '@crowdin/crowdin-api-client';

@Injectable()
export class TranslationsService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private translationsRedis: TranslationsRedisService
  ) {}

  public async getTranslation(languageCode: string) {
    let translations = await this.translationsRedis.getTranslations();
    console.log({ fromCache: translations });

    if (!translations) {
      translations = await this.getFromCrowdin();
      console.log({ returnedAfterCache: translations });
    }
    return translations.find(t => t.languageCodes.includes(languageCode));
  }

  private crowdinInit() {
    // credentials
    const credentials: Credentials = {
      token: 'personalAccessToken',
      organization: 'organizationName', // optional
    };

    // initialization of crowdin client
    const { projectsGroupsApi } = new Crowdin(credentials);
  }

  private async getCrowdinSupportedLanguages(): Promise<CrowdinLanguage[]> {
    const res = await Axios.get(
      `https://api.crowdin.com/api/supported-languages?json=''`
    );
    return res.data;
  }
}

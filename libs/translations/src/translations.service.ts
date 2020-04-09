import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import Axios from 'axios';
import AdmZip from 'adm-zip';
import { CrowdinLanguage, Translation } from './translations-model';
import { TranslationsRedisService } from './services/translations-redis.service';

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

  public async getFromCrowdin() {
    const languages = await this.getCrowdinSupportedLanguages();
    const success = await this.buildZips();
    console.log({ success });

    const zipFile = await this.downloadZip();
    console.log({ zipFile });

    const zipInstance = new AdmZip(zipFile);

    const translations = languages.reduce((allTranslations, lang) => {
      console.log({ lang });

      const translation: Translation = JSON.parse(
        zipInstance.readAsText(
          `/master/backend-i18n/languages/${lang.crowdin_code}.json`
        )
      );
      console.log({ translation });

      translation['languageCodes'] = Object.values(lang);
      return [...allTranslations, translation];
    }, []);

    console.log({ translationsProcessed: translations });

    await this.translationsRedis.saveTranslations(translations);
    return translations;
  }

  private async getCrowdinSupportedLanguages(): Promise<CrowdinLanguage[]> {
    const res = await Axios.get(
      `https://api.crowdin.com/api/supported-languages?json=''`
    );
    return res.data;
  }

  private async buildZips() {
    const { apiKey, projectId } = this.config.crowdin;
    const res = await Axios.get(
      `https://api.crowdin.com/api/project/${projectId}/export?key=${apiKey}`
    );
    return ['skipped', 'built'].includes(res?.data?.success?.status);
  }

  private async downloadZip() {
    const { apiKey, projectId } = this.config.crowdin;
    const res = await Axios.get(
      `https://api.crowdin.com/api/project/${projectId}/download/all.zip?key=${apiKey}`
    );
    return res.data;
  }
}

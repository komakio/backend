import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import Axios from 'axios';
import AdmZip from 'adm-zip';
import { CrowdinLanguage, CrowdinTranslation } from './translations-model';
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
    if (!translations) {
      translations = await this.getFromCrowdin();
    }
    translations.find(t => t.languageCodes.includes(languageCode));
  }

  public async getFromCrowdin() {
    const languages = await this.getCrowdinSupportedLanguages();
    await this.buildZips();
    const zipFile = await this.downloadZip();
    const zipInstance = new AdmZip(zipFile);

    const translations = languages.reduce((allTranslations, lang) => {
      const translation: CrowdinTranslation = JSON.parse(
        zipInstance.readAsText(
          `/master/backend-i18n/languages/${lang.crowdin_code}.json`
        )
      );
      translation['languageCodes'] = Object.values(lang);
      return [...allTranslations, translation];
    }, []);
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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import Axios from 'axios';
import AdmZip from 'adm-zip';
import { LanguageCode } from './translations-model';
import { TranslationsRedisService } from './services/translations-redis.service';
import fs from 'fs';

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
      await this.translationsRedis.saveTranslations(translations);
    }
    return translations.find(t => t.languageCodes.includes(languageCode));
  }

  public async getFromCrowdin() {
    await this.buildZips();
    await this.downloadZip();
    const translations = await this.getNormalizedJson();
    await this.deleteZip();
    return translations;
  }

  private async getCrowdinSupportedLanguages(): Promise<LanguageCode[]> {
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
      `https://api.crowdin.com/api/project/${projectId}/download/all.zip?key=${apiKey}`,
      { responseType: 'stream' }
    );

    res.data.pipe(fs.createWriteStream('all.zip'));

    return res.data;
  }

  private async deleteZip() {
    fs.unlink('all.zip', err => {
      if (err) {
        this.logger.verbose({
          route: 'delete-translations-zip-file',
          error: err?.message,
        });
      }
    });
  }

  private async getNormalizedJson() {
    const languages = await this.getCrowdinSupportedLanguages();
    const zipInstance = new AdmZip('./all.zip');

    const translations = languages.reduce((allTranslations, lang) => {
      const file = zipInstance.getEntry(
        `master/backend-i18n/languages/${lang.locale}.json`
      );
      if (!file) {
        return allTranslations;
      }
      const translation = JSON.parse(file.getData().toString('utf-8'));
      translation['languageCodes'] = Object.values(lang);
      return [...allTranslations, translation];
    }, []);

    return translations;
  }
}

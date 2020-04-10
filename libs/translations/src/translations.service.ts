import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import { LanguageCode, Translation } from './translations-model';
import { TranslationsRedisService } from './services/translations-redis.service';
import { crowdinSourceStrings } from './data/source';
import AdmZip from 'adm-zip';
import Axios from 'axios';
import fs from 'fs';
import { ExceptionsService } from '@backend/exceptions';

@Injectable()
export class TranslationsService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private exceptions: ExceptionsService,
    private translationsRedis: TranslationsRedisService
  ) {}

  private fileName = 'all.zip';

  public async get(args: {
    languageCode: string;
    variables: {
      name: string;
    };
  }) {
    if (!args.languageCode) {
      this.replaceVariables({
        translation: { ...crowdinSourceStrings },
        variables: args.variables,
      });

      return crowdinSourceStrings;
    }

    let translations = await this.translationsRedis.getWithExpire();

    if (!translations) {
      translations = await this.getFromCrowdin();
      await this.cache(translations);
    }

    let translation = translations.find(t =>
      t.languageCodes.includes(args.languageCode)
    );

    if (!translation) {
      translation = crowdinSourceStrings;
    }

    //replace variables with real data (eg. {{name}} => Ali)
    this.replaceVariables({ translation, variables: args.variables });
    return translation;
  }

  private replaceVariables(args: {
    translation: Translation;
    variables: object;
  }) {
    for (const tKey in args.translation) {
      if (args.translation.hasOwnProperty(tKey) && tKey !== 'languageCodes') {
        for (const vKey in args.variables) {
          if (args.variables.hasOwnProperty(vKey)) {
            args.translation[tKey] = args.translation[tKey].replace(
              `{{${vKey}}}`,
              `${args.variables[vKey]}`
            );
          }
        }
      }
    }
  }

  private async getFromCrowdin() {
    try {
      await this.buildZips();
    } catch (err) {
      this.logger.verbose({
        route: 'get-translations-from-crowdin',
        error: err?.message,
      });
      this.exceptions.report(err);
      return this.translationsRedis.getWithoutExpire();
    }

    await this.downloadZip();
    const translations = await this.getNormalizedJson();
    this.deleteZip();

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
    const success = ['skipped', 'built'].includes(res?.data?.success?.status);
    if (!success) {
      throw { message: 'zip build failed!' };
    }
  }

  private async downloadZip() {
    const { apiKey, projectId } = this.config.crowdin;
    const res = await Axios.get(
      `https://api.crowdin.com/api/project/${projectId}/download/all.zip?key=${apiKey}`,
      { responseType: 'stream' }
    );

    res.data.pipe(fs.createWriteStream(this.fileName));

    return res.data;
  }

  private deleteZip() {
    fs.unlink(this.fileName, err => {
      if (err) {
        //skip
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

  private async cache(translations: Translation[]) {
    if (!translations) {
      return;
    }
    await this.translationsRedis.saveWithExpire(translations);
    await this.translationsRedis.saveWithoutExpire(translations);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import { Translation } from './translations-model';
import { TranslationsRedisService } from './services/translations-redis.service';
import Axios from 'axios';
import { ExceptionsService } from '@backend/exceptions';
import { englishStrings } from './data/english-strings';
import { supportedTranslations } from './data/supported-translations';

@Injectable()
export class TranslationsService {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private exceptions: ExceptionsService,
    private translationsRedis: TranslationsRedisService
  ) {}

  public async get(args: {
    languageCode: string;
    variables: {
      name: string;
    };
  }) {
    const languageCode = supportedTranslations.find(l =>
      [l.locale, l.crowdinCode].includes(args.languageCode)
    )?.locale;

    let translation = await this.translationsRedis.getWithExpire(languageCode);

    if (!translation) {
      translation = await this.getFromGithub(languageCode);
      await this.cache({
        languageCode: languageCode,
        translation: translation || englishStrings,
      });
    }

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

  private async getFromGithub(languageCode: string) {
    if (!languageCode || languageCode === 'en-US') {
      return this.getEnglishFromGithub();
    }

    try {
      const res = await Axios.get(
        `https://raw.githubusercontent.com/komakio/app/master/backend-i18n/languages/${languageCode}.json`
      );
      return res.data;
    } catch (err) {
      this.logger.verbose({
        route: 'get-translations-from-github',
        error: err?.message,
      });
      this.exceptions.report(err);
      return this.getEnglishFromGithub();
    }
  }

  private getEnglishFromGithub = async () => {
    try {
      const res = await Axios.get(
        'https://raw.githubusercontent.com/komakio/app/master/backend-i18n/en.json'
      );
      return res.data;
    } catch (err) {
      this.logger.verbose({
        route: 'get-english-from-github',
        error: err?.message,
      });
      this.exceptions.report(err);
    }
  };

  private async cache(args: {
    languageCode: string;
    translation: Translation;
  }) {
    await this.translationsRedis.saveWithExpire(args);
    await this.translationsRedis.saveForever(args);
  }
}

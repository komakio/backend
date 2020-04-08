import { Injectable } from '@nestjs/common';
import { RedisService } from '@backend/redis';
import { CrowdinLanguage, Translation } from '../translations-model';

@Injectable()
export class TranslationsRedisService {
  constructor(private redis: RedisService) {}
  private expiryTime = 1 * 60 * 60;
  private languagesListKey = `${this.redis.prefix}:crowdin-languages-list`;
  private translationsKey = `${this.redis.prefix}:crowdin-translations`;

  public async saveLanguagesList(languages: CrowdinLanguage[]) {
    this.redis.db.set(this.languagesListKey, JSON.stringify(languages));
    this.redis.db.expire(this.languagesListKey, this.expiryTime);
  }

  public async getLanguagesList() {
    const res = await this.redis.db.get(this.languagesListKey);
    return JSON.parse(res);
  }

  public async clearLanguagesList() {
    this.redis.db.del(this.languagesListKey);
  }

  public async saveTranslations(translations: Translation[]) {
    this.redis.db.set(this.translationsKey, JSON.stringify(translations));
    this.redis.db.expire(this.translationsKey, this.expiryTime);
  }

  public async getTranslations(): Promise<Translation[]> {
    const res = await this.redis.db.get(this.translationsKey);
    return JSON.parse(res);
  }

  public async clearTranslations() {
    this.redis.db.del(this.translationsKey);
  }
}

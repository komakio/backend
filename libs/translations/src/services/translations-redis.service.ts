import { Injectable } from '@nestjs/common';
import { RedisService } from '@backend/redis';
import { Translation } from '../translations-model';

@Injectable()
export class TranslationsRedisService {
  constructor(private redis: RedisService) {}

  public async saveWithExpire(args: {
    languageCode: string;
    translation: Translation;
  }) {
    const key = this.getWithExpireKey(args.languageCode);
    this.redis.db.set(key, JSON.stringify(args.translation));
    this.redis.db.expire(key, 1 * 60 * 60);
  }

  public async getWithExpire(languageCode: string): Promise<Translation> {
    const key = this.getWithExpireKey(languageCode);
    const res = await this.redis.db.get(key);
    return JSON.parse(res);
  }

  public async saveForever(args: {
    languageCode: string;
    translation: Translation;
  }) {
    const key = this.getForeverKey(args.languageCode);
    this.redis.db.set(key, JSON.stringify(args.translation));
  }

  public async getForever(languageCode: string): Promise<Translation> {
    const key = this.getForeverKey(languageCode);
    const res = await this.redis.db.get(key);
    return JSON.parse(res);
  }

  private getWithExpireKey = (languageCode: string) => {
    return `${this.redis.prefix}:crowdin-translations:${languageCode}`;
  };

  private getForeverKey = (languageCode: string) => {
    return `${this.redis.prefix}:crowdin-translations-forever:${languageCode}`;
  };
}

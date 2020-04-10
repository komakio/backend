import { Injectable } from '@nestjs/common';
import { RedisService } from '@backend/redis';
import { Translation } from '../translations-model';

@Injectable()
export class TranslationsRedisService {
  constructor(private redis: RedisService) {}
  private translationsKey = `${this.redis.prefix}:crowdin-translations`;
  private foreverKey = `${this.redis.prefix}:crowdin-translations-forever`;

  public async saveWithExpire(translations: Translation[]) {
    this.redis.db.set(this.translationsKey, JSON.stringify(translations));
    this.redis.db.expire(this.translationsKey, 1 * 60 * 60);
  }

  public async getWithExpire(): Promise<Translation[]> {
    const res = await this.redis.db.get(this.translationsKey);
    return JSON.parse(res);
  }

  public async saveWithoutExpire(translations: Translation[]) {
    this.redis.db.set(this.foreverKey, JSON.stringify(translations));
  }

  public async getWithoutExpire(): Promise<Translation[]> {
    const res = await this.redis.db.get(this.foreverKey);
    return JSON.parse(res);
  }
}

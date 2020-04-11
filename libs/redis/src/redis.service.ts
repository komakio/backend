import { Injectable } from '@nestjs/common';
import IoRedis from 'ioredis';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';

@Injectable()
export class RedisService {
  public db: IoRedis.Redis;
  public isConnected = false;
  private promises: any[] = [];

  constructor(private config: ConfigService, private logger: LoggerService) {
    this.init();
  }

  public prefix: string = this.config.redis.prefix;

  public async init() {
    if (this.db) {
      return;
    }

    if (this.config.redis.sentinelMask) {
      const sentinels = [];
      for (let i = 0; i < this.config.redis.sentinelCount; i++) {
        sentinels.push({
          host: this.config.redis.sentinelMask.replace('{instance}', `${i}`),
          port: this.config.redis.port,
        });
      }
      this.db = new IoRedis({
        sentinels,
        name: this.config.redis.sentinelName,
      });
    } else {
      this.db = new IoRedis({
        port: this.config.redis.port,
        host: this.config.redis.host,
        password: this.config.redis.password,
        family: 4, // 4 (IPv4) or 6 (IPv6)
        db: this.config.redis.database,
        tls: this.config.redis.isAws ? {} : undefined,
      });
    }

    this.db.on('connect', () => {
      this.logger.debug('Redis client connected');
      this.isConnected = true;
      this.promises.forEach(resolve => resolve());
    });

    this.db.on('error', err => {
      this.logger.warn('Redis client error');
      console.warn(err);
      this.isConnected = false;
    });
  }

  public async close() {
    this.db.disconnect();
  }

  public async waitReady() {
    if (this.isConnected) {
      return Promise.resolve();
    }
    return new Promise(resolve => this.promises.push(resolve));
  }

  public clearRedisKeys = (pattern: string): Promise<void> =>
    new Promise(resolve => {
      const stream = this.db.scanStream({
        match: pattern,
      });
      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          const pipeline = this.db.pipeline();
          keys.forEach(function(key) {
            pipeline.del(key);
          });
          pipeline.exec();
        }
      });
      stream.on('end', resolve);
    });
}

import { Injectable } from '@nestjs/common';
import { HealthCheckError } from '@godaddy/terminus';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redis: RedisService) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.redis.isConnected;
    const result = this.getStatus('redis', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Redis connection failed.', result);
  }
}

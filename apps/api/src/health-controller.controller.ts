import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@backend/redis/health';
import { MongoHealthIndicator } from '@backend/mongo/health';

@Controller('healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redisHealthIndicator: RedisHealthIndicator,
    private mongoHealthIndicator: MongoHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  public readiness() {
    return this.health.check([
      async () => this.redisHealthIndicator.isHealthy(),
      async () => this.mongoHealthIndicator.isHealthy(),
    ]);
  }
}

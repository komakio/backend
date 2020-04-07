import { Injectable } from '@nestjs/common';
import { HealthCheckError } from '@godaddy/terminus';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { MongoService } from './mongo.service';

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(private mongo: MongoService) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.mongo.isConnected;
    const result = this.getStatus('mongodb', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('MongoDB connection failed.', result);
  }
}

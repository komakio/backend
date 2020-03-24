import {
  TerminusEndpoint,
  TerminusOptionsFactory,
  // DNSHealthIndicator,
  TerminusModuleOptions,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  // constructor(
  //   private readonly dns: DNSHealthIndicator,
  // ) {}

  public createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/healthcheck',
      healthIndicators: [],
    };
    return {
      endpoints: [healthEndpoint],
    };
  }
}

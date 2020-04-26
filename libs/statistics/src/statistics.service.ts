import { Injectable } from '@nestjs/common';
import { ProfilesService } from '@backend/profiles';
import { RequestsService } from '@backend/requests';
import { UsersService } from '@backend/users';
import { Cron } from '@nestjs/schedule';
import Amplitude from 'amplitude';
import { ConfigService } from '@backend/config';

@Injectable()
export class StatisticsService {
  private amplitude = new Amplitude(this.config.amplitudeToken);

  constructor(
    private profiles: ProfilesService,
    private requests: RequestsService,
    private users: UsersService,
    private config: ConfigService
  ) {}

  public async getStatistics() {
    const users = await this.users.getStats();
    const requests = await this.requests.getStats();
    const profiles = await this.profiles.getStats();
    return { users, profiles, requests };
  }

  @Cron('0 0 * * * *')
  public async sendStatistics() {
    // TODO : When growing we should run this as a Kubernetes CronJob
    if (!this.config.amplitudeToken) {
      return;
    }
    const [userStats, requestStats, profileStats] = await Promise.all([
      this.users.getStats(),
      this.requests.getStats(),
      this.profiles.getStats(),
    ]);

    await Promise.all([
      this.amplitude.track({
        event_type: 'users',
        user_id: 'admin',
        event_properties: userStats,
      }),
      this.amplitude.track({
        event_type: 'requests',
        user_id: 'admin',
        event_properties: requestStats,
      }),
      this.amplitude.track({
        event_type: 'profiles',
        user_id: 'admin',
        event_properties: profileStats,
      }),
    ]);
  }
}

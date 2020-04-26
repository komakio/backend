import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { UsersModule } from '@backend/users';
import { RequestsModule } from '@backend/requests';
import { ProfilesModule } from '@backend/profiles';
import { ConfigModule } from '@backend/config';

@Module({
  providers: [StatisticsService],
  exports: [StatisticsService],
  imports: [UsersModule, RequestsModule, ProfilesModule, ConfigModule],
})
export class StatisticsModule {}

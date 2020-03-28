import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@backend/config';
import { LoggerModule } from '@backend/logger';

@Module({
  providers: [NotificationsService],
  imports: [ConfigModule, LoggerModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@backend/config';

@Module({
  providers: [NotificationsService],
  imports: [ConfigModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}

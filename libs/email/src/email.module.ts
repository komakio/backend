import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@backend/config';

@Module({
  providers: [EmailService],
  imports: [ConfigModule],
  exports: [EmailService],
})
export class EmailModule {}

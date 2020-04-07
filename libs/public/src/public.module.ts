import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { EmailModule } from '@backend/email';

@Module({
  providers: [PublicService],
  imports: [EmailModule],
  exports: [PublicService],
})
export class PublicModule {}

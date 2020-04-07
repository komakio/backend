import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { EmailModule } from '@backend/email';
import { PublicController } from './public.controller';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [EmailModule],
  exports: [PublicService],
})
export class PublicModule {}

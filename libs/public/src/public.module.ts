import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { EmailModule } from '@backend/email';
import { PublicController } from './public.controller';
import { ConfigModule } from '@backend/config';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [EmailModule, ConfigModule],
  exports: [PublicService],
})
export class PublicModule {}

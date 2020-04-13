import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { EmailModule } from '@backend/email';
import { PublicController } from './public.controller';
import { ConfigModule } from '@backend/config';
import { UsersModule } from '@backend/users';
import { RequestsModule } from '@backend/requests';
import { ProfilesModule } from '@backend/profiles';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [
    EmailModule,
    ConfigModule,
    UsersModule,
    RequestsModule,
    ProfilesModule,
  ],
  exports: [PublicService],
})
export class PublicModule {}

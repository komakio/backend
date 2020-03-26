import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesMongoService } from './services/profiles.mongo.service';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfilesMongoService],
  imports: [MongoModule, ConfigModule],
  exports: [ProfilesService],
})
export class ProfilesModule {}

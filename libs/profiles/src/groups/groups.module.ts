import { Module } from '@nestjs/common';
import { MongoModule } from '@backend/mongo';
import { ConfigModule } from '@backend/config';
import { GroupsMongoService } from './services/groups-mongo.service';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [GroupsController],
  providers: [GroupsMongoService, GroupsService],
  imports: [MongoModule, ConfigModule],
  exports: [GroupsService],
})
export class GroupsModule {}

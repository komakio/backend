import { Module } from '@nestjs/common';
import { MongoModule } from '@backend/mongo';
import { GroupsMongoService } from './services/groups-mongo.service';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [GroupsController],
  providers: [GroupsMongoService, GroupsService],
  imports: [MongoModule],
  exports: [GroupsService],
})
export class GroupsModule {}

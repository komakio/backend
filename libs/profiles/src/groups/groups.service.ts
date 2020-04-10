import { Injectable } from '@nestjs/common';
import { Group } from './groups.model';
import { GroupsMongoService } from './services/groups-mongo.service';

@Injectable()
export class GroupsService {
  constructor(private groupsMongo: GroupsMongoService) {}

  public async findGroupBySecret(secret: string) {
    return this.groupsMongo.findOneBy({ secret });
  }

  public async createOneGroup(data: Partial<Group>) {
    return this.groupsMongo.createOne(data);
  }
}

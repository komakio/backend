import { Injectable } from '@nestjs/common';
import { Group } from './groups.model';
import { GroupsMongoService } from './services/groups-mongo.service';

@Injectable()
export class GroupsService {
  constructor(private groupsMongo: GroupsMongoService) {}

  public async findOneBySecret(secret: string) {
    return this.groupsMongo.findOneBy({ secret });
  }

  public async create(data: Partial<Group>) {
    return this.groupsMongo.createOne(data);
  }
}

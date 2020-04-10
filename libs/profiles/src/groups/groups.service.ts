import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ProfilesMongoService } from './services/profiles-mongo.service';
import { Profile } from './profile.model';
import { ObjectID } from 'mongodb';
import { getDistance } from '@utils/distance';
import { ConfigService } from '@backend/config';
import { Group } from './groups.model';
import { GroupsMongoService } from './services/groups-mongo.service';

@Injectable()
export class GroupsService {
  constructor(
    private config: ConfigService,
    private groupsMongo: GroupsMongoService
  ) {}

  public async findGroupBySecret(secret: string) {
    return this.groupsMongo.findOneBy({ secret });
  }
}

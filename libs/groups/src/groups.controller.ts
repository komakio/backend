import { Controller, Post, Body } from '@nestjs/common';
import { Auth } from '@utils/decorators';
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { Group } from './groups.model';
import { CreateGroupDto } from './groups.dto';

@ApiTags('groups')
@Controller('v1/groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Auth('admin')
  @Post()
  public async create(@Body() body: CreateGroupDto): Promise<Group> {
    const group = await this.groups.create(body);
    return group?.serialize();
  }
}

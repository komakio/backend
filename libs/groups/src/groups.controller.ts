import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Auth } from '@utils/decorators';
import { ObjectID } from 'mongodb';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { Group } from './groups.model';

class CreateGroupDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  public managersUserIds: ObjectID[];
  @IsString()
  @ApiProperty()
  public secret: string;
  @IsString()
  @ApiProperty()
  public name: string;
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  public url?: string;
}

@ApiTags('groups')
@Controller('v1/groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Auth('admin')
  @Post()
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new group.',
    type: Group,
  })
  public async create(@Body() body: CreateGroupDto): Promise<Group> {
    const group = await this.groups.create(body);
    return group?.serialize();
  }
}

import { Controller, Post, Body, Put, Param, Get, Patch } from '@nestjs/common';
import { UserReq, Auth } from '@utils/decorators';
import { ProfilesService } from './profiles.service';
import { ObjectID } from 'mongodb';
import { Profile, ProfileStatistics } from './profile.model';
import { User } from '@backend/users/users.model';
import { ProfilesRabbitMQService } from './services/profiles-rabbitmq.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import {
  PatchProfilesDto,
  CreateProfilesDto,
  AddToGroupDto,
} from './profiles.dto';

@ApiTags('profiles')
@Controller('v1/profiles')
export class ProfilesController {
  constructor(
    private profiles: ProfilesService,
    private profileRabbitMQ: ProfilesRabbitMQService
  ) {}

  @Auth()
  @Get()
  public async get(@UserReq() user: User): Promise<Profile[]> {
    return this.profiles.findAllByUserId(new ObjectID(user._id));
  }

  @Auth()
  @Post()
  @ApiBody({ type: CreateProfilesDto })
  public async create(
    @Body() body: CreateProfilesDto,
    @UserReq() userReq: User
  ): Promise<Profile> {
    const profile = await this.profiles.create({
      ...body,
      userId: new ObjectID(userReq._id),
    });

    if (body.self && body.role === 'helper') {
      await this.profileRabbitMQ.sendToSubscribeNewHelperRequests({
        profileId: profile._id,
      });
    }
    return profile;
  }

  @Auth()
  @Put(':id')
  @ApiBody({ type: PatchProfilesDto })
  public async patch(
    @Param('id') id: string,
    @UserReq() user: User,
    @Body() data: PatchProfilesDto
  ) {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(id),
      userId: new ObjectID(user._id),
    });
    await this.profiles.patchOneById({ id: new ObjectID(id), data });
  }

  @Auth()
  @Patch(':id/group')
  @ApiBody({ type: AddToGroupDto })
  public async addToGroup(
    @Param('id') profileId: string,
    @UserReq() user: User,
    @Body() data: AddToGroupDto
  ) {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(profileId),
      userId: new ObjectID(user._id),
    });
    const group = await this.profiles.addOneToGroup({
      profileId: new ObjectID(profileId),
      groupSecret: data.secret,
    });
    return { group: group?.serialize() };
  }

  @Auth('admin')
  @Get('statistics')
  public async getStats(): Promise<ProfileStatistics> {
    return this.profiles.getStatistics();
  }
}

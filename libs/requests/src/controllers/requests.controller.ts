import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { UserReq, Auth } from '@utils/decorators';
import { User } from '@backend/users/users.model';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';
import { Profile } from '@backend/profiles/profiles.model';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { RequestBodyDto } from '../requests.dto';

@Controller('v1/requests')
@ApiTags('requests')
export class RequestsController {
  constructor(
    private requests: RequestsService,
    private profiles: ProfilesService
  ) {}

  @Auth()
  @Post()
  @ApiBody({ type: RequestBodyDto })
  public async create(
    @UserReq() user: User,
    @Body() body: RequestBodyDto
  ): Promise<HelpRequest> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    const request = await this.requests.createOne(new ObjectID(body.profileId));
    return request;
  }

  @Auth()
  @Post(':id/cancel')
  @ApiBody({ type: RequestBodyDto })
  public async cancel(
    @Param('id') id: string,
    @UserReq() user: User,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    await this.requests.cancelOne(new ObjectID(id));
  }

  @Auth()
  @Post(':id/accept')
  @ApiBody({ type: RequestBodyDto })
  public async accept(
    @UserReq() user: User,
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    await this.requests.validateRequestResponseMatch({
      id: new ObjectID(id),
      responseProfileId: new ObjectID(body.profileId),
    });
    await this.requests.acceptOne({
      id: new ObjectID(id),
      acceptorProfileId: new ObjectID(body.profileId),
    });
  }

  @Auth()
  @Post(':id/refuse')
  @ApiBody({ type: RequestBodyDto })
  public async refuse(
    @UserReq() user: User,
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    await this.requests.validateRequestResponseMatch({
      id: new ObjectID(id),
      responseProfileId: new ObjectID(body.profileId),
    });
    await this.requests.refuseOne({
      id: new ObjectID(id),
      refuserProfileId: new ObjectID(body.profileId),
    });
  }

  @Auth()
  @Post(':id/finish')
  @ApiBody({ type: RequestBodyDto })
  public async finish(
    @UserReq() user: User,
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    await this.requests.validateRequestProfileIdMatch({
      id: new ObjectID(id),
      profileId: new ObjectID(body.profileId),
    });
    await this.requests.finishOne({
      id: new ObjectID(id),
      profileId: new ObjectID(body.profileId),
    });
  }

  @Auth()
  @Get(':id/profiles/:profileId')
  public async getProfileRequests(
    @Param('id') id: string,
    @Param('profileId') profileId: string
  ): Promise<Profile[]> {
    return this.requests.findRequestProfilesDetailsById({
      id: new ObjectID(id),
      profileId: new ObjectID(profileId),
    });
  }
}

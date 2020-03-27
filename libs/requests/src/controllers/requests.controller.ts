import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { UserReq, Auth } from 'utils/decorators';
import { User } from '@backend/users/users.model';
import { RequestsRabbitMQService } from '../services/requests-rabbitmq.service';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { IsString } from 'class-validator';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';
import { Profile } from '@backend/profiles/profile.model';

class RequestBodyDto {
  @IsString()
  public profileId: string;
}

@Controller('v1/requests')
export class RequestsController {
  constructor(
    private requestsRabbitMQ: RequestsRabbitMQService,
    private requests: RequestsService,
    private profiles: ProfilesService
  ) {}

  @Auth()
  @Post()
  public async create(
    @UserReq() user: User,
    @Body() body: RequestBodyDto
  ): Promise<HelpRequest> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(body.profileId),
      userId: new ObjectID(user._id),
    });
    const profile = await this.profiles.findOneById(
      new ObjectID(body.profileId)
    );
    const request = await this.requests.createOne({
      requesterShortName: profile.firstName,
      location: profile?.address?.location,
      status: 'pending',
      requesterProfileId: new ObjectID(body.profileId),
      type: 'misc',
    });
    await this.requestsRabbitMQ.sendToDispatchRequests({
      profileId: new ObjectID(body.profileId),
      requestId: new ObjectID(request._id),
    });

    return request;
  }

  @Auth()
  @Post(':id/cancel')
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
  public async accept(
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
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
  public async refuse(
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
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
  public async finish(
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    //todo: validate
    await this.requests.validateRequestProfileIdMatch({
      id: new ObjectID(id),
      profileId: new ObjectID(body.profileId),
    });
    await this.requests.finish({
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

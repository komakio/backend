import { Controller, Param, Get } from '@nestjs/common';
import { UserReq, Auth } from 'utils/decorators';
import { User } from '@backend/users/users.model';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';

@Controller('v1')
export class ProfilesRequestsController {
  constructor(
    private requests: RequestsService,
    private profiles: ProfilesService
  ) {}

  @Auth()
  @Get('profiles/:id/requests')
  public async getProfileRequests(
    @UserReq() user: User,
    @Param('id') id: string
  ): Promise<HelpRequest[]> {
    await this.profiles.validateProfileUserMatch({
      id: new ObjectID(id),
      userId: new ObjectID(user._id),
    });
    const requests = await this.requests.findAllNewestByProfileId({
      profileId: new ObjectID(id),
    });
    return requests;
  }
}

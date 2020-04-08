import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { UserReq, Auth } from '@utils/decorators';
import { User } from '@backend/users/users.model';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { IsString } from 'class-validator';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';
import { Profile } from '@backend/profiles/profile.model';
import { ApiTags, ApiProperty, ApiBody, ApiResponse } from '@nestjs/swagger';
import { TranslationsService } from '@backend/translations';

class RequestBodyDto {
  @IsString()
  @ApiProperty()
  public profileId: string;
}

@Controller('v1/requests')
@ApiTags('requests')
export class RequestsController {
  constructor(
    private requests: RequestsService,
    private profiles: ProfilesService,
    private translations: TranslationsService
  ) {}

  @Get()
  public async test(): Promise<void> {
    console.log('entered');

    const t = await this.translations.getTranslation('en');
    console.log({ t });
  }

  @Auth()
  @Post()
  @ApiBody({ type: RequestBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a request.',
    type: HelpRequest,
  })
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
  @ApiResponse({
    status: 201,
    description: 'Successfully cancelled the request.',
  })
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
  @ApiResponse({
    status: 201,
    description: 'Successfully accepted the request.',
  })
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
  @ApiBody({ type: RequestBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully refused the request.',
  })
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
  @ApiBody({ type: RequestBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully marked the request as finished.',
  })
  public async finish(
    @Param('id') id: string,
    @Body() body: RequestBodyDto
  ): Promise<void> {
    //todo: validate
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
  @ApiResponse({
    status: 200,
    description:
      'Successfully returned the requester and acceptor profile details',
    type: [Profile],
  })
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

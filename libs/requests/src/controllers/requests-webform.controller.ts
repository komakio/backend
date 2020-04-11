import { Controller, Post, Body } from '@nestjs/common';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import {
  CommunicateByTypeEnum,
  ProfileRoleEnum,
} from '@backend/profiles/profile.model';
import { Auth } from '@utils/decorators';
import { WebFormRequestBodyDto } from '../requests.dto';

@Controller('v1/requests')
@ApiTags('requests')
export class RequestsWebFormController {
  constructor(
    private requests: RequestsService,
    private profiles: ProfilesService
  ) {}

  @Auth('anonymous')
  @Post('webform')
  @ApiBody({ type: WebFormRequestBodyDto })
  public async create(
    @Body() body: WebFormRequestBodyDto
  ): Promise<HelpRequest> {
    const profile = await this.profiles.create({
      firstName: body.firstName,
      lastName: body.lastName,
      role: ProfileRoleEnum.Needer,
      phone: {
        dialCode: body.phone.dialCode,
        number: body.phone.number,
      },
      address: body.address,
      email: body.email,
      communicateBy: [CommunicateByTypeEnum.Email],
    });
    const request = await this.requests.createOne(new ObjectID(profile._id));

    return request;
  }
}

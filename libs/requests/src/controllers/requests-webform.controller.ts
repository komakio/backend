import { Controller, Post, Body } from '@nestjs/common';
import { RequestsService } from '../requests.service';
import { ObjectID } from 'mongodb';
import { IsString, ValidateNested } from 'class-validator';
import { ProfilesService } from '@backend/profiles';
import { HelpRequest } from '../requests.model';
import { ApiTags, ApiProperty, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Phone, Address } from '@backend/profiles/profile.model';
import { Type } from 'class-transformer';

class WebFormRequestBodyDto {
  @IsString()
  @ApiProperty()
  public firstName: string;
  @IsString()
  @ApiProperty()
  public lastName: string;
  @ValidateNested()
  @Type(() => Address)
  @ApiProperty({ type: Address })
  public address: Address;
  @ValidateNested()
  @Type(() => Phone)
  @ApiProperty({ type: Phone })
  public phone: Phone;
  @IsString()
  @ApiProperty()
  public email: string;
  @IsString()
  @ApiProperty()
  public captcha: string;
}

@Controller('v1/requests')
@ApiTags('requests')
export class RequestsWebFormController {
  constructor(
    private requests: RequestsService,
    private profiles: ProfilesService
  ) {}

  @Post('webform')
  @ApiBody({ type: WebFormRequestBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a request through web form.',
    type: HelpRequest,
  })
  public async create(
    @Body() body: WebFormRequestBodyDto
  ): Promise<HelpRequest> {
    //validate the token

    //create a profile
    const profile = await this.profiles.create({
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'needer',
      phone: {
        dialCode: body.phone.dialCode,
        number: body.phone.number,
      },
      address: body.address,
      email: body.email,
      isWebForm: true,
    });
    //create the request
    const request = await this.requests.createOne(new ObjectID(profile._id));

    return request;
  }
}

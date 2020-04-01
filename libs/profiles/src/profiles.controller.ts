import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import {
  IsString,
  IsBoolean,
  IsIn,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { UserReq, Auth } from '@utils/decorators';
import { ProfilesService } from './profiles.service';
import { ObjectID } from 'mongodb';
import { Type } from 'class-transformer';
import {
  Profile,
  Phone,
  Address,
  ProfileRoleType,
  ProfileRoleEnum,
} from './profile.model';
import { User } from '@backend/users/users.model';
import { ProfilesRabbitMQService } from './services/profiles-rabbitmq.service';
import { UsersService } from '@backend/users';
import { ApiTags, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';

class CreateProfilesDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  public self?: boolean;
  @IsString()
  @ApiProperty()
  public firstName: string;
  @IsString()
  @ApiProperty()
  public lastName: string;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  @ApiProperty({ type: Address })
  public address?: Address;
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  public disabled?: boolean;
  @IsIn((ProfileRoleEnum as unknown) as any[])
  @ApiProperty({ enum: ProfileRoleEnum })
  public role: ProfileRoleType;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Phone)
  @ApiProperty({ type: Phone })
  public phone: Phone;
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  public coverage: number;
}

class PatchProfilesDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  public self?: boolean;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public firstName: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public lastName: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  @ApiProperty({ type: Address })
  public address?: Address;
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean;
  @IsOptional()
  @IsIn((ProfileRoleEnum as unknown) as any[])
  @ApiProperty({ enum: ProfileRoleEnum })
  public role: ProfileRoleType;
  @IsOptional()
  @ValidateNested()
  @Type(() => Phone)
  @ApiProperty({ type: Phone })
  public phone: Phone;
  @IsOptional()
  @IsNumber()
  public coverage: number;
}

@ApiTags('profiles')
@Controller('v1/profiles')
export class ProfilesController {
  constructor(
    private users: UsersService,
    private profiles: ProfilesService,
    private profileRabbitMQ: ProfilesRabbitMQService
  ) {}

  @Auth()
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully returned all the user`s profiles.',
    type: [Profile],
  })
  public async get(@UserReq() user: User): Promise<Profile[]> {
    return this.profiles.findAllByUserId(new ObjectID(user._id));
  }

  @Auth()
  @Post()
  @ApiBody({ type: CreateProfilesDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new profile.',
    type: Profile,
  })
  public async create(
    @Body() body: CreateProfilesDto,
    @UserReq() userReq: User
  ): Promise<Profile> {
    const profile = await this.profiles.create({
      ...body,
      userId: new ObjectID(userReq._id),
    });
    const user = await this.users.findOneById(new ObjectID(userReq._id));
    const registrationTokens = Object.values(user.uuidRegTokenPair || {});

    if (body.self && body.role === 'helper') {
      await this.profileRabbitMQ.sendToSubscribeNewHelperRequests({
        profileId: profile._id,
        registrationTokens,
      });
    }
    return profile;
  }

  @Auth()
  @Put(':id')
  @ApiBody({ type: PatchProfilesDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the profile.',
  })
  public async patch(@Param('id') id: string, @Body() data: PatchProfilesDto) {
    await this.profiles.patchOneById({ id: new ObjectID(id), data });
  }
}

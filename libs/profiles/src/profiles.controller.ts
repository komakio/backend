import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import {
  IsString,
  IsBoolean,
  IsIn,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { UserReq, Auth } from 'utils/decorators';
import { ProfilesService } from './profiles.service';
import { ObjectID } from 'mongodb';
import { Type } from 'class-transformer';
import { Profile, Phone, UuidRegTokenPair, Address } from './profile.model';
import { User } from '@backend/users/users.model';

class CreateProfilesDto {
  @IsOptional()
  @IsBoolean()
  public self?: boolean;
  @IsString()
  public firstName: string;
  @IsString()
  public lastName: string;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  public address?: Address;
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean;
  @IsIn(['helper', 'needer'])
  public role: 'helper' | 'needer';
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
}

class PatchProfilesDto {
  @IsOptional()
  @IsBoolean()
  public self?: boolean;
  @IsOptional()
  @IsString()
  public firstName: string;
  @IsOptional()
  @IsString()
  public lastName: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  public address?: Address;
  @IsOptional()
  @IsBoolean()
  public disabled?: boolean;
  @IsOptional()
  @IsIn(['helper', 'needer'])
  public role?: 'helper' | 'needer';
  @IsOptional()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
}

@Controller('v1/profiles')
export class ProfilesController {
  constructor(private profile: ProfilesService) {}

  @Auth()
  @Get()
  public async get(@UserReq() user: User): Promise<Profile[]> {
    return this.profile.findAllByUserId(new ObjectID(user._id));
  }

  @Auth()
  @Post()
  public async create(
    @Body() body: CreateProfilesDto,
    @UserReq() user: User
  ): Promise<Profile> {
    return this.profile.create({
      ...body,
      userId: new ObjectID(user._id),
    });
  }

  @Auth()
  @Put(':id')
  public async patch(@Param('id') id: string, @Body() data: PatchProfilesDto) {
    await this.profile.patchOneById({ id: new ObjectID(id), data });
  }
}

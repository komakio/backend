import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { IsString, IsBoolean, IsIn, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { UserReq, Auth } from 'utils/decorators';
import { ProfilesService } from './profiles.service';
import { ObjectID } from 'mongodb';
import { Type } from 'class-transformer';
import { Location, Profile } from './profile.model';
import { User } from '@users/users/users.model';

class CreateProfilesDto {
    @IsOptional()
    @IsBoolean()
    public self?: boolean;
    @IsString()
    public name: string;
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Location)
    public location?: Location;
    @IsOptional()
    @IsBoolean()
    public disabled?: boolean;
    @IsIn(['helper', 'needer'])
    public role: 'helper' | 'needer';
    @IsString()
    public phone: string;
    @IsString()
    public country: string;
}

class PatchProfilesDto {
    @IsOptional()
    @IsBoolean()
    public self?: boolean;
    @IsOptional()
    @IsString()
    public name: string;
    @IsOptional()
    @ValidateNested()
    @Type(() => Location)
    public location?: Location;
    @IsOptional()
    @IsBoolean()
    public disabled?: boolean;
    @IsOptional()
    @IsIn(['helper', 'needer'])
    public role: 'helper' | 'needer';
    @IsOptional()
    @IsString()
    public phone: string;
    @IsOptional()
    @IsString()
    public country: string;
}

@Controller('v1/profiles')
export class ProfilesController {
    constructor(private profile: ProfilesService) {}

    @Auth()
    @Post()
    public async create(@Body() body: CreateProfilesDto, @UserReq() user: User): Promise<Profile> {
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

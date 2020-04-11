import {
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Address, ProfileRoleEnum, Phone } from './profile.model';
import { Type } from 'class-transformer';

export class PatchProfilesDto {
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
  @IsEnum(ProfileRoleEnum)
  public role: ProfileRoleEnum;
  @IsOptional()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
  @IsOptional()
  @IsNumber()
  public coverage: number;
}

export class CreateProfilesDto {
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
  @IsEnum(ProfileRoleEnum)
  public role: ProfileRoleEnum;
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
  @IsOptional()
  @IsNumber()
  public coverage: number;
}

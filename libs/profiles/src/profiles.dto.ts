import {
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
  IsNotEmpty,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Address, Phone } from './profiles.model';
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
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
  @IsOptional()
  @IsPositive()
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
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;
  @IsOptional()
  @IsPositive()
  public coverage: number;
}

export class AddToGroupDto {
  @IsString()
  public secret: string;
}

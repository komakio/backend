import { IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Address, Phone } from '@backend/profiles/profiles.model';

export class WebFormRequestBodyDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  public address: Address;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Phone)
  public phone: Phone;

  @IsString()
  public email: string;
}

export class RequestBodyDto {
  @IsString()
  public profileId: string;
}

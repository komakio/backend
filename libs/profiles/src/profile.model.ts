import { ObjectID } from 'mongodb';
import {
  IsIn,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Location {
  @IsIn(['Point'])
  public type: 'Point';
  @IsNumber({}, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  public coordinates?: [number, number];
}

export class Address {
  @IsString()
  public raw: string;
  @IsOptional()
  @IsString()
  public country?: string;
  @ValidateNested()
  @Type(() => Location)
  public location?: Location;
}

export class Phone {
  @IsOptional()
  @IsString()
  public dialCode?: string;
  @IsString()
  public number: string;
}

export class Profile {
  public _id: ObjectID;
  public userId: ObjectID;
  public createdAt: Date;
  public lastActivityAt: Date;
  public lastAffirmativeAt: Date;
  public self?: boolean;
  public firstName: string;
  public lastName: string;
  public address?: Address;
  public disabled?: boolean;
  public role: 'helper' | 'needer';
  public phone: Phone;
}

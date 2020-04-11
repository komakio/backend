import { ObjectID } from 'mongodb';
import {
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum CoordinateTypeEnum {
  Point = 'Point',
}

export enum ProfileRoleEnum {
  Helper = 'helper',
  Needer = 'needer',
}

export enum CommunicateByTypeEnum {
  Email = 'email',
}

export class Location {
  @IsEnum(CoordinateTypeEnum)
  public type: CoordinateTypeEnum;
  @IsNumber({}, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ApiProperty({
    example: [3.234564, -52.123425],
    description: `first element a valid longitude 
    (between -180 and 180, both inclusive),
    second element a valid latitude 
    (between -90 and 90, both inclusive)`,
  })
  public coordinates?: [number, number];
}

export class Address {
  @IsOptional()
  @IsString()
  public raw: string;
  @IsOptional()
  @IsString()
  public extra: string;
  @IsOptional()
  @IsString()
  public postalCode: string;
  @IsOptional()
  @IsString()
  public city: string;
  @IsOptional()
  @IsString()
  public country?: string;
  @ValidateNested({ each: true })
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
  @ApiProperty({ type: String })
  public _id: ObjectID;
  @ApiProperty({ type: String })
  public userId: ObjectID;
  public createdAt: Date;
  public updatedAt: Date;
  public lastActivityAt: Date;
  public lastAffirmativeAt: Date;
  public self: boolean;
  public firstName: string;
  public lastName: string;
  public address: Address;
  public disabled: boolean;
  public role: ProfileRoleEnum;
  public phone: Phone;
  @ApiProperty({
    example: 2000,
    description: `in meters`,
  })
  public coverage: number;
  public email: string;
  public communicateBy: CommunicateByTypeEnum[];
}

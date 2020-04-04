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
import { ApiProperty } from '@nestjs/swagger';

export const CoordinateTypeEnum = ['Point'];
export type CoordinateType = typeof CoordinateTypeEnum[number];

export const ProfileRoleEnum = ['helper', 'needer'] as const;
export type ProfileRoleType = typeof ProfileRoleEnum[number];

export class Location {
  @IsIn(CoordinateTypeEnum)
  @ApiProperty({ enum: CoordinateTypeEnum })
  public type: CoordinateType;
  @IsNumber({}, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ApiProperty({
    type: Number,
    isArray: true,
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
  @ApiProperty()
  public raw: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public extra: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public postalCode: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public city: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  public country?: string;
  @ValidateNested()
  @Type(() => Location)
  @ApiProperty({ type: Location })
  public location?: Location;
}

export class Phone {
  @IsOptional()
  @IsString()
  @ApiProperty()
  public dialCode?: string;
  @IsString()
  @ApiProperty()
  public number: string;
}

export class Profile {
  @ApiProperty({ type: String })
  public _id: ObjectID;
  @ApiProperty({ type: String })
  public userId: ObjectID;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;
  @ApiProperty()
  public lastActivityAt: Date;
  @ApiProperty()
  public lastAffirmativeAt: Date;
  @ApiProperty()
  public self: boolean;
  @ApiProperty()
  public firstName: string;
  @ApiProperty()
  public lastName: string;
  @ApiProperty()
  public address: Address;
  @ApiProperty()
  public disabled: boolean;
  @ApiProperty({ enum: ProfileRoleEnum })
  public role: ProfileRoleType;
  @ApiProperty({ type: Phone })
  public phone: Phone;
  @ApiProperty({
    example: 2000,
    description: `in meters`,
  })
  public coverage: number;
  @ApiProperty()
  public isWebForm: boolean;
  @ApiProperty()
  public email: string;
}

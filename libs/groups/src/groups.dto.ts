import { IsArray, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectID } from 'mongodb';

export class CreateGroupDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: String, isArray: true })
  public managersUserIds: ObjectID[];
  @IsString()
  public secret: string;
  @IsString()
  public groupName: string;
  @IsOptional()
  @IsString()
  public groupUrl?: string;
}

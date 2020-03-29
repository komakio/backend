import { IsNumber, IsString } from 'class-validator';
import { User } from '../users.model';
import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  public user: User;
  @IsNumber()
  public iat: number;
  @IsNumber()
  public exp: number;
}

export class AccessTokenResponse {
  @ApiProperty()
  @IsString()
  public token: string;
  /** Timestamp of expiration in ms */
  @ApiProperty()
  @IsNumber()
  public expiration: number;
}

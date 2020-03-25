import { IsNumber, IsString } from 'class-validator';
import { User } from '../users.model';

export class AccessToken {
  public user: User;
  @IsNumber()
  public iat: number;
  @IsNumber()
  public exp: number;
}

export class AccessTokenResponse {
  @IsString()
  public token: string;
  /** Timestamp of expiration in ms */
  @IsNumber()
  public expiration: number;
}

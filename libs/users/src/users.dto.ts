import { IsString, IsOptional } from 'class-validator';

export class UserPassLoginDto {
  @IsString()
  public username: string;
  @IsString()
  public password: string;
}

export class CaptchaLoginDto {
  @IsString()
  public captcha: string;
}

export class IdentityTokenLoginDto {
  @IsString()
  public identityToken: string;
}

export class FacebookLoginDto {
  @IsString()
  public fbAccessToken: string;
}

export class RegistrationTokenDto {
  @IsString()
  public uuid: string;
  @IsString()
  public registrationToken: string;
}

export class PatchUserDto {
  @IsOptional()
  @IsString()
  public language?: string;
}

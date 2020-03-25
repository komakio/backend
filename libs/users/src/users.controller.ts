import { Controller, Post, Body } from '@nestjs/common';
import { IsString } from 'class-validator';
import { UsersService } from './users.service';
import { User } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { AccessTokenResponse } from './auth/auth.models';

class RegisterDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}

class AppleLoginDto {
  @IsString()
  public identityToken: string;
}

export class LoginDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}

class LoginResult {
  public user: User;
  public accessToken: AccessTokenResponse;
}

@Controller('v1/users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post('login')
  public async register(@Body() body: RegisterDto): Promise<LoginResult> {
    const user = await this.users.registerOrLogin(body);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }

  @Post('login/apple')
  // public async appleLogin(@Body() body: AppleLoginDto): Promise<LoginResult> {
  public async appleLogin(@Body() body: AppleLoginDto): Promise<{}> {
    const user = await this.users.appleLogin(body.identityToken);
    // const accessToken = await this.auth.generateAccessToken(user);
    // return { user: user.serialize(), accessToken };
    return {};
  }
}

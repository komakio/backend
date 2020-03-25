import { Controller, Post, Body } from '@nestjs/common';
import { IsString } from 'class-validator';
import { UsersService } from './users.service';
import { User } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { AccessTokenResponse } from './auth/auth.models';

class LoginDto {
  @IsString()
  public identityToken: string;
}

class LoginResult {
  public user: User;
  public accessToken: AccessTokenResponse;
}

@Controller('v1/users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post('login/apple')
  public async appleLogin(@Body() body: LoginDto): Promise<LoginResult> {
    const user = await this.users.appleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }

  @Post('login/google')
  public async googleLogin(@Body() body: LoginDto): Promise<LoginResult> {
    const user = await this.users.googleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }
}

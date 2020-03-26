import { Controller, Post, Body, Patch } from '@nestjs/common';
import { IsString, IsObject } from 'class-validator';
import { UsersService } from './users.service';
import { User, UuidRegTokenPair } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { AccessTokenResponse } from './auth/auth.models';
import { UserReq } from 'utils/decorators';
import { ObjectID } from 'mongodb';

class LoginDto {
  @IsString()
  public identityToken: string;
}

class RegistrationTokenDto {
  @IsString()
  public uuid: string;
  @IsString()
  public registrationToken: string;
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

  @Patch('registration-token')
  public async registrationToken(
    @UserReq() user: User,
    @Body() body: RegistrationTokenDto
  ): Promise<void> {
    await this.users.patch({
      id: new ObjectID(user._id),
      data: {
        [`uuidRegTokenPair.${body.uuid}`]: body.registrationToken,
      },
    });
  }
}

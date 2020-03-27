import { Controller, Post, Body, Patch, Get } from '@nestjs/common';
import { IsString } from 'class-validator';
import { UsersService } from './users.service';
import { User } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { AccessTokenResponse } from './auth/auth.models';
import { UserReq, Auth } from 'utils/decorators';
import { ObjectID } from 'mongodb';

class UserPassLoginDto {
  @IsString()
  public username: string;
  @IsString()
  public password: string;
}

class IdentityTokenLoginDto {
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

  @Auth()
  @Get('/current')
  public async getCurrent(@UserReq() userReq: User): Promise<User> {
    const user = await this.users.findOneById(new ObjectID(userReq._id));
    return user.serialize();
  }

  @Post('login')
  public async register(@Body() body: UserPassLoginDto): Promise<LoginResult> {
    const user = await this.users.passwordLogin(body);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }

  @Post('login/apple')
  public async appleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.appleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }

  @Post('login/google')
  public async googleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.googleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user.serialize(), accessToken };
  }

  @Patch('registration-token')
  public async patchRegistrationToken(
    @UserReq() user: User,
    @Body() body: RegistrationTokenDto
  ): Promise<void> {
    await this.users.patch({
      id: new ObjectID(user._id),
      set: {
        [`uuidRegTokenPair.${body.uuid}`]: body.registrationToken,
      },
    });
  }

  @Post('registration-token/unset')
  public async deleteRegistrationToken(
    @UserReq() user: User,
    @Body() body: RegistrationTokenDto
  ): Promise<void> {
    await this.users.patch({
      id: new ObjectID(user._id),
      unset: {
        [`uuidRegTokenPair.${body.uuid}`]: '',
      },
    });
  }
}

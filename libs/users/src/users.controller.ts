import { Controller, Post, Body, Patch, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, LoginResult } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { UserReq, Auth } from '@utils/decorators';
import { ObjectID } from 'mongodb';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  UserPassLoginDto,
  CaptchaLoginDto,
  IdentityTokenLoginDto,
  RegistrationTokenDto,
  PatchUserDto,
} from './users.dto';

@Controller('v1/users')
@ApiTags('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Auth()
  @Get('current')
  @ApiResponse({
    description: 'Successfully returned the current user.',
    type: User,
  })
  public async getCurrent(@UserReq() userReq: User): Promise<User> {
    const user = await this.users.findOneById(new ObjectID(userReq._id));
    return user?.serialize();
  }

  @Post('captcha')
  @ApiBody({ type: UserPassLoginDto })
  @ApiResponse({
    description: 'Successfully logged in using recaptcha',
    type: LoginResult,
  })
  public async captchaLogin(
    @Body() body: CaptchaLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.recaptchaLogin(body.captcha);
    const accessToken = await this.auth.generateAccessToken(
      user,
      10 * 60 * 1000
    );
    return { user: user?.serialize(), accessToken };
  }

  @Post('login')
  @ApiBody({ type: UserPassLoginDto })
  @ApiResponse({
    description: 'Successfully logged in.',
    type: LoginResult,
  })
  public async login(@Body() body: UserPassLoginDto): Promise<LoginResult> {
    const user = await this.users.passwordLogin(body);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Post('login/apple')
  @ApiBody({ type: IdentityTokenLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully logged in.',
    type: LoginResult,
  })
  public async appleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.appleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Post('login/google')
  @ApiBody({ type: IdentityTokenLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully logged in.',
    type: LoginResult,
  })
  public async googleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.googleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Auth()
  @Patch('registration-token')
  @ApiBody({ type: RegistrationTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully added the registration token.',
  })
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

  @Auth()
  @Post('registration-token/unset')
  @ApiBody({ type: RegistrationTokenDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully removed the registration token.',
  })
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

  @Auth()
  @Patch()
  @ApiBody({ type: PatchUserDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the user.',
  })
  public async patch(@UserReq() user: User, @Body() data: PatchUserDto) {
    await this.users.patch({ id: new ObjectID(user._id), set: data });
  }
}

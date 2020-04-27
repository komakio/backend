import { Controller, Post, Body, Patch, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, LoginResult } from './users.model';
import { AuthService } from './auth/services/auth.service';
import { UserReq, Auth } from '@utils/decorators';
import { ObjectID } from 'mongodb';
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
  public async getCurrent(@UserReq() userReq: User): Promise<User> {
    const user = await this.users.findOneById(new ObjectID(userReq._id));
    return user?.serialize();
  }

  @Post('captcha')
  @ApiBody({ type: UserPassLoginDto })
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
  public async login(@Body() body: UserPassLoginDto): Promise<LoginResult> {
    const user = await this.users.passwordLogin(body);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Post('login/apple')
  @ApiBody({ type: IdentityTokenLoginDto })
  public async appleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.appleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Post('login/google')
  @ApiBody({ type: IdentityTokenLoginDto })
  public async googleLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.googleLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Post('login/facebook')
  @ApiBody({ type: IdentityTokenLoginDto })
  public async facebookLogin(
    @Body() body: IdentityTokenLoginDto
  ): Promise<LoginResult> {
    const user = await this.users.facebookLogin(body.identityToken);
    const accessToken = await this.auth.generateAccessToken(user);
    return { user: user?.serialize(), accessToken };
  }

  @Auth()
  @Patch('registration-token')
  @ApiBody({ type: RegistrationTokenDto })
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
  public async patch(@UserReq() user: User, @Body() data: PatchUserDto) {
    await this.users.patch({ id: new ObjectID(user._id), set: data });
  }
}

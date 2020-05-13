import { TestingModule } from '@nestjs/testing';
import { UsersService } from '@backend/users';
import { mockHelperUser, mockNeederUser } from '@backend/users/mock/users.mock';
import { ProfilesService } from '@backend/profiles';
import {
  mockHelperProfile,
  mockNeederProfile,
} from '@backend/profiles/mocks/profiles.mock';
import { Profile } from '@backend/profiles/profiles.model';
import { User, SocialAuthTypeEnum } from '@backend/users/users.model';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '@backend/users/auth/services/auth.service';

export const prePopulateMirrorUsers = async (moduleFixture: TestingModule) => {
  const usersService = moduleFixture.get(UsersService);
  const authService = moduleFixture.get(AuthService);

  //sign up users
  const [helper, needer] = await Promise.all(
    [mockHelperUser, mockNeederUser].map(({ username, password }) =>
      usersService.passwordLogin({
        username: username,
        password: password,
      })
    )
  );
  const [helperTokenRes, neederTokenRes] = await Promise.all(
    [helper, needer].map(u => authService.generateAccessToken(u, 10000000))
  );
  return {
    helper: { user: helper, token: helperTokenRes.token },
    needer: { user: needer, token: neederTokenRes.token },
  };
};

export const prePopulateMirrorProfiles = async (args: {
  users: {
    needer: User;
    helper: User;
  };
  moduleFixture: INestApplication | TestingModule;
}) => {
  const profilesService = args.moduleFixture.get(ProfilesService);
  const [helper, needer]: Profile[] = await Promise.all(
    [mockHelperProfile, mockNeederProfile].map((profile, index) =>
      profilesService.create({
        ...profile,
        userId: args.users[index === 0 ? 'helper' : 'needer']._id,
      })
    )
  );

  return { helper, needer };
};

export const prePopulateUserAndProfiles = async (args: {
  user: User;
  profiles: Profile[];
  moduleFixture: TestingModule;
}) => {
  const usersService = args.moduleFixture.get(UsersService);
  const profilesService = args.moduleFixture.get(ProfilesService);
  const authService = args.moduleFixture.get(AuthService);

  let user: User;
  if (args.user.username && args.user.password) {
    user = await usersService.passwordLogin({
      username: args.user.username,
      password: args.user.password,
    });
  } else if (args.user.socialAuthType === SocialAuthTypeEnum.Google) {
    user = await usersService.googleLogin('fakeIdentityToken');
  } else if (args.user.socialAuthType === SocialAuthTypeEnum.Apple) {
    user = await usersService.appleLogin('fakeIdentityToken');
  } else if (user.isAnonymous) {
    user = await usersService.recaptchaLogin('fakeCaptchaResponse');
  }

  const profiles: Profile[] = await Promise.all(
    args.profiles.map(profile =>
      profilesService.create({
        ...profile,
        userId: user._id,
      })
    )
  );

  const tokenRes = await authService.generateAccessToken(user, 10000000);

  return { user, token: tokenRes.token, profiles };
};

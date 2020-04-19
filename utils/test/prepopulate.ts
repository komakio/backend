import { TestingModule } from '@nestjs/testing';
import { UsersModule, UsersService } from '@backend/users';
import { mockHelperUser, mockNeederUser } from './users.mock';
import { ProfilesModule, ProfilesService } from '@backend/profiles';
import { mockHelperProfile, mockNeederProfile } from './profiles.mock';
import { Profile } from '@backend/profiles/profile.model';
import { User } from '@backend/users/users.model';
import { INestApplication } from '@nestjs/common';

export const prePopulateUsers = async (moduleFixture: TestingModule) => {
  const usersModule = moduleFixture.select(UsersModule);
  const usersService = usersModule.get(UsersService) as UsersService;
  //sign up users
  const [helper, needer] = await Promise.all(
    [mockHelperUser, mockNeederUser].map(({ username, password }) =>
      usersService.passwordLogin({
        username: username,
        password: password,
      })
    )
  );
  return { helper, needer };
};

export const prePopulateProfiles = async (args: {
  users: {
    needer: User;
    helper: User;
  };
  moduleFixture: TestingModule | INestApplication;
}) => {
  const profilesModule = args.moduleFixture.select(ProfilesModule);
  const profileService = profilesModule.get(ProfilesService) as ProfilesService;

  const [helper, needer]: Profile[] = await Promise.all([
    profileService.create({
      ...mockHelperProfile,
      userId: args.users.helper._id,
    }),
    profileService.create({
      ...mockNeederProfile,
      userId: args.users.needer._id,
    }),
  ]);

  return { helper, needer };
};

import { TestingModule } from '@nestjs/testing';
import { UsersModule, UsersService } from '@backend/users';
import { mockHelperUser, mockNeederUser } from './users.mock';
import { ProfilesModule, ProfilesService } from '@backend/profiles';
import { mockHelperProfile, mockNeederProfile } from './profiles.mock';
import { Profile } from '@backend/profiles/profile.model';

export const prePopulateUsersAndProfiles = async (
  moduleFixture: TestingModule
) => {
  const profilesModule = moduleFixture.select(ProfilesModule);
  const profileService = profilesModule.get(ProfilesService) as ProfilesService;
  const usersModule = moduleFixture.select(UsersModule);
  const usersService = usersModule.get(UsersService) as UsersService;
  //sign up users
  const users = await Promise.all(
    [mockHelperUser, mockNeederUser].map(({ username, password }) =>
      usersService.passwordLogin({
        username: username,
        password: password,
      })
    )
  );

  const profiles: Profile[] = await Promise.all([
    profileService.create({
      ...mockHelperProfile,
      userId: users.find(u => u.username === 'helper@komak.io')._id,
    }),
    profileService.create({
      ...mockNeederProfile,
      userId: users.find(u => u.username === 'needer@komak.io')._id,
    }),
  ]);

  return { users, profiles };
};

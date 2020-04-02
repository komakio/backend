import { TestingModule } from '@nestjs/testing';
import { UsersModule, UsersService } from '@backend/users';
import { dummyUsers } from './users';

export const prePopulateUsers = async (moduleFixture: TestingModule) => {
  const usersModule = moduleFixture.select(UsersModule);
  const usersService = usersModule.get(UsersService) as UsersService;
  //sign up users
  await Promise.all(
    dummyUsers.map(({ user, password }) =>
      usersService.passwordLogin({
        username: user.username,
        password: password,
      })
    )
  );
};

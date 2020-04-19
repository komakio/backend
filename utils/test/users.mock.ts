import { User } from '@backend/users/users.model';

export const mockHelperUser: Partial<User> = {
  uuidRegTokenPair: { uuidHelper: 'regtokenHelper' },
  username: 'helper@komak.io',
  language: 'en',
  password: '1233456',
};

export const mockNeederUser: Partial<User> = {
  uuidRegTokenPair: { uuidNeeder: 'regtokenNeeder' },
  username: 'needer@komak.io',
  language: 'fr',
  password: '1233456',
};

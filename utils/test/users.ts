import { User } from '@backend/users/users.model';
import { ObjectID } from 'mongodb';

export const dummyUsers = [
  {
    type: 'helper',
    user: new User({
      _id: new ObjectID(),
      username: `helper+${Date.now()}@komak.io`,
      password: '123',
    }),
  },
  {
    type: 'needer',
    user: new User({
      _id: new ObjectID(),
      username: `needer+${Date.now()}@komak.io`,
      password: '123',
    }),
  },
];

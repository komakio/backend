import { User } from '@backend/users/users.model';
import { ObjectID } from 'mongodb';

export const dummyUsers = [
  {
    type: 'helper',
    password: '123',
    user: new User({
      _id: new ObjectID(),
      username: `helper+${Date.now()}@komak.io`,
    }),
  },
  {
    type: 'needer',
    password: '123',
    user: new User({
      _id: new ObjectID(),
      username: `needer+${Date.now()}@komak.io`,
    }),
  },
];

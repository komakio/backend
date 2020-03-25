import * as bcrypt from 'bcrypt';
import { SHA256 } from 'sha2';

export const hashString = async (string: string): Promise<string> => {
  return bcrypt.hash(SHA256(string).toString('base64'), 10);
};

export const compareHash = async (
  clearPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(
    SHA256(clearPassword).toString('base64'),
    hashedPassword
  );
};

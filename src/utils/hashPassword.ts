import { compare, hash } from 'bcrypt';

export const verifyPassword = (password: string, storedPassword: string) => {
  return compare(password, storedPassword);
};

export const hashPassword = (password: string) => {
  return hash(password, 12);
};

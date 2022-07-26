import { hash } from 'bcrypt';

export const hashPassword = (password: string) => {
  return hash(password, 12);
};

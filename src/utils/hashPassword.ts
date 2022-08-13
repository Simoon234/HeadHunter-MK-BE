import { compare, hash } from "bcrypt";

export const verifyPassword = (
  password: string,
  storedPassword: string
): Promise<boolean> => {
  return compare(password, storedPassword);
};

export const hashPassword = (password: string): Promise<string> => {
  return hash(password, 12);
};

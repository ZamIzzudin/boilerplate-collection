import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (
  plain: string,
  hashed: string,
): Promise<boolean> => bcrypt.compare(plain, hashed);

/** Password policy matching the frontend `passwordField` validator. */
export const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).{8,}$/;

export const isStrongPassword = (password: string): boolean =>
  PASSWORD_REGEX.test(password);

export const AUTH_TOKEN_EXPIRY = '1h';
export const AUTH_REFRESH_TOKEN_EXPIRY = '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 50;
export const EMAIL_VERIFICATION_MESSAGE = 'Please verify your email address.';
export const LOGIN_ATTEMPT_LIMIT = 5;

export const ERROR_MESSAGES = {
  USER_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
};

export enum AuthRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
  HOD = 'HOD',
  PRINCIPAL = 'PRINCIPAL',
  HR = 'HR',
  RECRUITER = 'RECRUITER',
}

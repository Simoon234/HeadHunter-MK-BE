import 'dotenv/config';

export const ACTIVATION_HR_URL = 'http://localhost:3000/activation/hr';
export const ACTIVATION_STUDENT_URL =
  'http://localhost:3000/activation/student';
export const TOKEN_ADDED_USER_HR =
  process.env.TOKEN_ADDED_USER_HR || 'Random string';
export const CONNECTION_DB =
  process.env.CONNECTION_DB || 'mongodb://localhost:27017';
export const REGISTER_TOKEN_USER =
  process.env.REGISTER_TOKEN_USER || 'Random string';
export const LOG_TOKEN = process.env.LOG_TOKEN || 'Random string';
export const REFRESH_TOKEN_REMINDER =
  process.env.REFRESH_TOKEN_REMINDER || 'Random string';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hh.com';
export const HOST = process.env.HOST || 'http://localhost:3000';
export const PORT = process.env.PORT || 3002;
export const MAIL_HOST = process.env.MAIL_HOST || '';
export const MAIL_USER = process.env.MAIL_USER || '';
export const MAIL_PASS = process.env.MAIL_PASS || '';

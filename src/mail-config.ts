import { MAIL_HOST, MAIL_PASS, MAIL_USER } from '../config';

export const config = {
  transport: {
    host: MAIL_HOST,
    secure: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
};

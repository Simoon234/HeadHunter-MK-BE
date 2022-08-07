import { mailConfig } from '../config/mailConfig';

export const config = {
  transport: {
    host: mailConfig.host,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.auth.user,
      pass: mailConfig.auth.pass,
    },
    tls: {
      rejectUnauthorized: mailConfig.tls.rejectUnauthorized,
    },
  },
};

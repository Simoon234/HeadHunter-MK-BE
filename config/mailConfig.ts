interface EmailSettings {
  host: string;
  secure: boolean;
  auth: { user: string; pass: string };
  tls: { rejectUnauthorized: boolean };
}

export const mailConfig: EmailSettings = {
  host: 'smtp.sendgrid.net',
  secure: false,
  auth: {
    user: 'apikey',
    pass: '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',
  },
  tls: {
    rejectUnauthorized: false,
  },
};

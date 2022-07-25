import { HandlebarsAdapter } from '@nest-modules/mailer';

export = {
    transport: `smtp://admin1:admin1@localhost:2500`,
    defaults: {
        from: 'admin@test.gmail.com',
    },
    template: {
        dir: './templates/email',
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
        },
    },
};

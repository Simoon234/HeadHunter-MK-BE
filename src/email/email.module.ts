import {Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {MailerModule} from "@nest-modules/mailer";
import mailConfig = require("../mail.config");


@Module({
    imports: [MailerModule.forRoot(mailConfig)],
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule {
}

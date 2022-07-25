import {Inject, Injectable} from '@nestjs/common';
import {MailerService} from "@nest-modules/mailer";

interface SentMessageInfo {
    to: string,
    subject,
    html: string;
}


@Injectable()
export class EmailService {
    constructor(@Inject(MailerService) private readonly mailerService: MailerService) {
    }

    async sendEmail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
        return this.mailerService.sendMail({
            to,
            subject,
            html
        })
    }
}

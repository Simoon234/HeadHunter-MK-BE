import {MailerService} from '@nestjs-modules/mailer';
import {Inject, Injectable} from '@nestjs/common';

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

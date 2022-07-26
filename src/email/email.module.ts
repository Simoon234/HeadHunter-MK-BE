import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import mailConfig = require('../mailconfig');

@Module({
  imports: [MailerModule.forRoot(mailConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

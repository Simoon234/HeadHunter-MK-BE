import {Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {MailerModule} from '@nestjs-modules/mailer';
import {config} from '../configGrid';

@Module({
  imports: [MailerModule.forRoot(config)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {
}

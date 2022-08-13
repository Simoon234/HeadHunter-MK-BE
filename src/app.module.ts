import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { HrModule } from './hr/hr.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { CONNECTION_DB } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(CONNECTION_DB),
    AdminModule,
    UserModule,
    HrModule,
    EmailModule,
    ScheduleModule.forRoot(),
    AuthModule,
  ],
})
export class AppModule {}

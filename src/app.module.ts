import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user/user.module";
import { HrModule } from "./hr/hr.module";
import { EmailModule } from "./email/email.module";
import { AdminModule } from "./admin/admin.module";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.CONNECTION),
    AdminModule,
    UserModule,
    HrModule,
    EmailModule,
    ScheduleModule.forRoot()
  ]
})
export class AppModule {}

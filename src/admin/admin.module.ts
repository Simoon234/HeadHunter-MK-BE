import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { EmailModule } from "../email/email.module";
import { Admin, AdminSchema } from "../schemas/admin.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { HrSchema, HumanResources } from "../schemas/hr.schema";
import { JwtStr } from "../auth/jwt.startegy";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: HumanResources.name, schema: HrSchema }
    ]),
    EmailModule
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStr],
  exports: [JwtStr]
})
export class AdminModule {}

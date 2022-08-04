import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HrSchema, HumanResources } from '../schemas/hr.schema';
import { JwtStr } from './jwt.startegy';
import { EmailModule } from '../email/email.module';
import { Admin, AdminSchema } from '../schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: HumanResources.name, schema: HrSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStr],
  exports: [JwtStr],
})
export class AuthModule {}

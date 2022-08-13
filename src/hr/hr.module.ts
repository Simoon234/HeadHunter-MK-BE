import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { HrSchema, HumanResources } from '../schemas/hr.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HumanResources.name, schema: HrSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  controllers: [HrController],
  providers: [HrService],
})
export class HrModule {}

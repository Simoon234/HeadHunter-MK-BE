import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Admin, AdminSchema} from '../../../../../zadanie HR/HR/hr/src/schemas/admin.schema';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {User, UserSchema} from "../../../../../zadanie HR/HR/hr/src/schemas/user.schema";
import {EmailModule} from "../email/email.module";
import {HrSchema, HumanResources} from "../../../../../zadanie HR/HR/hr/src/schemas/hr.schema";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Admin.name, schema: AdminSchema},
        {name: User.name, schema: UserSchema},
        {name: HumanResources.name, schema: HrSchema},
    ]), EmailModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {
}

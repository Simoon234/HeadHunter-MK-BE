import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {EmailModule} from "../email/email.module";
import {Admin, AdminSchema} from "../schemas/admin.schema";
import {User, UserSchema} from "../schemas/user.schema";
import {HrSchema, HumanResources} from "../schemas/hr.schema";

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

import {Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {HrController} from './hr.controller';
import {HrService} from './hr.service';
import {HrSchema, HumanResources} from "../../../../../zadanie HR/HR/hr/src/schemas/hr.schema";

@Module({
  imports: [MongooseModule.forFeature([
    {name: HumanResources.name, schema: HrSchema}
  ])],
  controllers: [HrController],
  providers: [HrService]
})
export class HrModule {
}

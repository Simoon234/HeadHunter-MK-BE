import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from 'mongoose';
import {HumanResources} from "../../../../../zadanie HR/HR/hr/src/schemas/hr.schema";
import {hashPassword} from "../utils/hashPassword";
import {HrRegisterDto} from "./dto/hr.register.dto";

@Injectable()
export class HrService {
    constructor(@InjectModel(HumanResources.name) private humanResources: Model<HumanResources>) {
    }

    async register(id: string, obj: HrRegisterDto, res: any) {
        try {
            if (obj.password !== obj.passwordRepeat) {
                throw new HttpException('Password are not the same.', HttpStatus.BAD_REQUEST);
            }

            const hashPwd = await hashPassword(obj.password);

            await this.humanResources.updateOne({_id: id}, {$set: {password: hashPwd}})

            return res.json({
                message: "Successfully registered.",
                success: true
            });
        } catch (err) {
            res.json({
                message: err.message,
            })
            console.error(err)
        }
    }
}

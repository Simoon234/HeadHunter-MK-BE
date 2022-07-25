import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Response} from "express";
import {EmailService} from "../email/email.service";
import {sign, verify} from "jsonwebtoken";
import {compare} from 'bcrypt';
import {HrDto} from "../hr/dto/hr.dto";
import {hashPassword} from "../utils/hashPassword";
import {ChangePasswordInterface} from "../types";
import {HumanResources} from "../schemas/hr.schema";
import {User, UserDocument} from "../schemas/user.schema";
import {Admin, AdminDocument} from "../schemas/admin.schema";
import {ChangePassword} from "./dto/changePassword.dto";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @Inject(EmailService) private emailService: EmailService,
        @InjectModel(HumanResources.name) private humanResources: Model<HumanResources>,
    ) {
    }

    private static verifyPassword(password: string, storedPassword: string) {
        return compare(password, storedPassword)
    }

    async changePassword(email: string, obj: ChangePassword): Promise<ChangePasswordInterface> {
        if (obj.password !== obj.passwordRepeat) {
            throw new HttpException('Password are not the same.', HttpStatus.BAD_REQUEST);
        }
        const hashedPwd = await hashPassword(obj.password);
        const admin = await this.adminModel.findOneAndUpdate({email}, {
            $set: {
                password: hashedPwd
            }
        });

        return {
            email: admin.email,
            message: "Successfully updated"
        }
    }

    async upload(file: any, res: Response) {
        try {
            if (file.mimetype !== 'application/json') {
                return res.json({
                    message: "Sorry, we only accept JSON files."
                })
            }
            const convertFile = (file.buffer).toString();
            const parsedObject = JSON.parse(convertFile);

            parsedObject.map((obj) => {
                if (!(obj.email.includes('@'))) {
                    res.json({
                        message: `Sorry, we only accept valid email addresses. (${obj.email}) (missing '@')`
                    })
                    throw new Error(`[${obj.email}] does not have @`)
                }
            });


            const users = await this.userModel.insertMany(parsedObject);

            for (const user of users) {
                const token = sign({email: user.email}, 'x21j2uh3y1231231', {
                    expiresIn: '24h'
                })

                const checkTokenValid = verify(token, 'x21j2uh3y1231231');

                if (checkTokenValid) {
                    await this.emailService.sendEmail(user.email, 'Register', `Link do aktywacji...`);
                } else {
                    throw new Error('Token is not valid more');
                }

            }

            res.json({
                users,
                success: true
            })
        } catch (e) {
            if (e.code === 11000) {
                res.json({
                    message: e.message,
                    success: false,
                })
            }
            console.error(e.message)
        }
    }

    // first Registration
    async register(email: string, password: string) {
        const hashPwd = await hashPassword(password);
        const admin = new this.adminModel({
            email,
            password: hashPwd
        });
        const result = await admin.save();
        return {
            _id: result._id,
        }
    }

    // log admin -> zmienić DAĆ DO AUTH
    async login(email: string, password: string) {
        const admin = await this.adminModel.findOne({
            email
        });

        console.log(admin)

        if (!admin) {
            throw new Error('Admin not found')
        }

        const checkPassword = await AdminService.verifyPassword(password, admin.password);

        if (checkPassword === false) {
            throw new Error('Password is incorrect')
        }

        if (admin && checkPassword) {
            admin.token = sign({email: admin.email}, '12j3hg12u3123ug1y26312ui3');
            return {
                id: admin._id,
                email: admin.email,
            };
        }
    }

    //HR form
    async addHumanResource(obj: HrDto, res: Response) {
        try {
            const newHr = new this.humanResources({
                name: obj.name,
                lastName: obj.lastname,
                email: obj.email,
                company: obj.company,
                maxReservedStudents: obj.maxReservedStudents

            })
            const data = await newHr.save();

            //WYSŁAĆ MAILA

            return res.json({
                id: data._id,
                email: data.email
            })
        } catch (e) {
            if (e.code === 11000) {
                res.json({
                    message: e.message,
                    success: false,
                })
            }
            console.error(e.message)
        }
    }
}

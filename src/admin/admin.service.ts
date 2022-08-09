import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { EmailService } from '../email/email.service';
import { sign, verify } from 'jsonwebtoken';
import { HrDto } from '../hr/dto/hr.dto';
import { hashPassword } from '../utils/hashPassword';
import { Payload, Role } from '../types';
import { HumanResources } from '../schemas/hr.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { UpdateAdmin } from './dto/update-admin.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { ObjectId } from 'mongodb';
import { registerHr, registerUser } from '../templates/email/registration';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(EmailService) private emailService: EmailService,
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>,
  ) {}

  private static filterMethod(obj) {
    const {
      email,
      courseCompletion,
      courseEngagment,
      projectDegree,
      teamProjectDegree,
      bonusProjectUrls,
    } = obj;
    return {
      email,
      courseCompletion,
      courseEngagment,
      projectDegree,
      teamProjectDegree,
      bonusProjectUrls,
    };
  }

  async createTokenAndSendEmail(role: Role, payload: Payload, secret: string) {
    const token = sign({ email: payload.email, id: payload.id }, secret, {
      expiresIn: '7d',
    });

    const checkTokenValid = verify(token, secret);
    if (checkTokenValid) {
      if (role === Role.HR) {
        await this.emailService.sendEmail(
          payload.email,
          process.env.ADMIN_EMAIL,
          '[MegaK HeadHunters] Register',
          registerHr(payload.id, token),
        );
      }
      if (role === Role.STUDENT) {
        await this.emailService.sendEmail(
          payload.email,
          process.env.ADMIN_EMAIL,
          '[MegaK HeadHunters] Register',
          registerUser(payload.id, token),
        );
      }
    } else {
      throw new HttpException(
        'You had 7 days for registration. Token expired. Please contact - ' +
          process.env.ADMIN_EMAIL,
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      payload,
      secret,
      token,
    };
  }

  async upload(file: AddUsersDto[], res: Response) {
    try {
      const getAllUsers = await this.userModel.find({}).exec();
      const newUsers = [];

      file.map((obj) => {
        const { email } = obj;
        if (!email) {
          return;
        }

        if (
          !email.includes('@') ||
          !!newUsers.find((user) => user.email === email)
        ) {
          return;
        }

        newUsers.push(obj);
      });

      newUsers.map(async (newUser) => {
        if (!!getAllUsers.find((user) => user.email === newUser.email)) {
          return;
        }

        const user = new this.userModel(newUser);
        await user.save();

        const { token } = await this.createTokenAndSendEmail(
          Role.STUDENT,
          {
            email: user.email,
            id: user._id.toString(),
          },
          process.env.REGISTER_TOKEN_USER,
        );

        user.registerToken = token;
      });

      res.json({
        success: true,
      });
    } catch ({ code, message, result }) {
      if (code === 11000) {
        res.json({
          success: false,
          code,
        });
        console.error(message);
      }
    }
  }

  async update(id: string, obj: UpdateAdmin, res: Response): Promise<void> {
    try {
      let objToSave = {};
      if (obj.password) {
        if (obj.password !== obj.passwordRepeat) {
          throw new Error('Podane hasła nie są takie same');
        }

        const hashedPwd = await hashPassword(obj.password);
        objToSave = {
          password: hashedPwd,
          email: obj.email,
        };
      } else {
        objToSave = {
          email: obj.email,
        };
      }

      await this.adminModel.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...objToSave,
          },
        },
      );

      res.json({
        success: true,
        message: 'Successfully updated',
      });
    } catch {
      res.json({
        success: false,
      });
    }
  }

  //
  //HR form
  async addHumanResource(obj: HrDto, res: Response) {
    try {
      const newHr = new this.humanResources({
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        company: obj.company,
        maxStudents: obj.maxStudents,
      });

      const data = await newHr.save();

      const { token } = await this.createTokenAndSendEmail(
        Role.HR,
        {
          email: newHr.email,
          id: newHr._id.toString(),
        },
        process.env.REGISTER_TOKEN_USER,
      );

      newHr.registerToken = token;
      await newHr.save();
      res.json({
        success: true,
        user: {
          id: data._id,
          email: data.email,
        },
      });
    } catch (e) {
      if (e.code === 11000) {
        res.json({
          message: 'Email exist. Please try again.',
          success: false,
        });
      }
      console.error(e.message);
    }
  }

  // first Registration
  async register(email: string, password: string) {
    const hashPwd = await hashPassword(password);
    const admin = new this.adminModel({
      email,
      password: hashPwd,
    });
    const result = await admin.save();
    return {
      _id: result._id,
    };
  }
}

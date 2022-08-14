import { Inject, Injectable } from '@nestjs/common';
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
import { ADMIN_EMAIL, REGISTER_TOKEN_USER } from '../../config';
import { sendError } from '../utils/sendError';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(EmailService) private emailService: EmailService,
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>,
  ) {}

  async createTokenAndSendEmail(role: Role, payload: Payload, secret: string) {
    const token = sign({ email: payload.email, id: payload.id }, secret, {
      expiresIn: '7d',
    });

    const checkTokenValid = verify(token, secret);
    if (checkTokenValid) {
      if (role === Role.HR) {
        await this.emailService.sendEmail(
          payload.email,
          ADMIN_EMAIL,
          '[MegaK HeadHunters] Register',
          registerHr(payload.id, token),
        );
      }
      if (role === Role.STUDENT) {
        await this.emailService.sendEmail(
          payload.email,
          ADMIN_EMAIL,
          '[MegaK HeadHunters] Register',
          registerUser(payload.id, token),
        );
      }
    } else {
      sendError(`You had 7 days for registration. Token expired. Please contact - ' +
          ${ADMIN_EMAIL}`);
    }

    return {
      payload,
      secret,
      token,
    };
  }

  async uploadStudents(file: AddUsersDto[], res: Response) {
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

        if (newUser.courseCompletion < 0 || newUser.courseCompletion > 5) {
          newUser.courseCompletion = 0;
        }
        if (newUser.courseEngagement < 0 || newUser.courseEngagement > 5) {
          newUser.courseEngagement = 0;
        }
        if (newUser.projectDegree < 0 || newUser.projectDegree > 5) {
          newUser.projectDegree = 0;
        }
        if (newUser.teamProjectDegree < 0 || newUser.teamProjectDegree > 5) {
          newUser.teamProjectDegree = 0;
        }

        const user = new this.userModel(newUser);

        console.log({ user });

        const { token } = await this.createTokenAndSendEmail(
          Role.STUDENT,
          {
            email: user.email,
            id: user._id.toString(),
          },
          REGISTER_TOKEN_USER,
        );

        user.registerToken = token;

        console.log({ user });

        await user.save();
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

  async update(id: string, obj: UpdateAdmin, res: Response) {
    try {
      let objToSave;
      if (obj.password) {
        if (obj.password !== obj.passwordRepeat) {
          sendError('Podane hasła nie są takie same');
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

  async addHR(obj: HrDto, res: Response) {
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
        REGISTER_TOKEN_USER,
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
      res.json({
        message: e.message,
        success: false,
      });
    }
  }

  async register(email: string, password: string, res: Response) {
    try {
      const hashPwd = await hashPassword(password);
      const admin = new this.adminModel({
        email,
        password: hashPwd,
      });
      const result = await admin.save();
      res.json({ success: true, id: result._id });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }
}

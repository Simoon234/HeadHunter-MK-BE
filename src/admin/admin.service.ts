import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { EmailService } from '../email/email.service';
import { sign, verify } from 'jsonwebtoken';
import { HrDto } from '../hr/dto/hr.dto';
import { hashPassword } from '../utils/hashPassword';
import { Payload } from '../types';
import { HumanResources } from '../schemas/hr.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { UpdateAdmin } from './dto/update-admin.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { ObjectId } from 'mongodb';

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

  async createTokenAndSendEmail(payload: Payload, secret: string) {
    const token = sign({ email: payload.email, id: payload.id }, secret, {
      expiresIn: '24h',
    });

    const checkTokenValid = verify(token, secret);
    if (checkTokenValid) {
      // await this.emailService.sendEmail(
      //   payload.email,
      //   'Register',
      //   `Click link to register. + ${payload.id} + ${token}`,
      // );
    } else {
      throw new Error('Token is not valid anymore');
    }

    return {
      payload,
      secret,
      token,
    };
  }

  async upload(file: AddUsersDto[], res: Response) {
    try {
      file.map(async (obj) => {
        const { email } = obj;

        if (!email.includes('@')) {
          return;
        }

        const getAllUsers = await this.userModel.find({ email }).exec();

        if (getAllUsers.length === 0) {
          const newUser = new this.userModel(obj);
          await newUser.save();

          const getAll = await this.userModel
            .find({ email: newUser.email })
            .exec();

          getAll.map(async (user) => {
            const { token } = await this.createTokenAndSendEmail(
              { email: user.email, id: user._id.toString() },
              process.env.REGISTER_TOKEN_USER,
            );

            user.registerToken = token;
            await user.save();
          });
        }
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
          throw new HttpException(
            'Password are not the same.',
            HttpStatus.BAD_REQUEST,
          );
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
        { email: newHr.email, id: newHr._id.toString() },
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

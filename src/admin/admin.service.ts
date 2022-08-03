import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { EmailService } from '../email/email.service';
import { sign, verify } from 'jsonwebtoken';
import { HrDto } from '../hr/dto/hr.dto';
import { hashPassword, verifyPassword } from '../utils/hashPassword';
import { ChangePasswordInterface, FileInfoInterface, Payload } from '../types';
import { HumanResources } from '../schemas/hr.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { ChangePassword } from './dto/changePassword.dto';

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

  async upload(file: FileInfoInterface, res: Response) {
    const convertFile = file.buffer.toString();
    const parsedObject = JSON.parse(convertFile);

    try {
      if (file.mimetype !== 'application/json') {
        return res.json({
          message: 'Sorry, we only accept JSON files.',
        });
      }

      parsedObject.map(async (obj) => {
        if (!obj.email.includes('@')) {
          res.json({
            message: `Sorry, we only accept valid email addresses. (${obj.email}) (missing '@')`,
          });
          throw new Error(`[${obj.email}] does not have @`);
        }
      });

      const users = await this.userModel.insertMany(parsedObject);

      users.map(async (user) => {
        const { token } = await this.createTokenAndSendEmail(
          { email: user.email, id: user._id.toString() },
          process.env.REGISTER_TOKEN_USER,
        );
        user.registerToken = token;
        await user.save();
      });

      res.json({
        users: users.map((item) => AdminService.filterMethod(item)),
        status: 'Success',
      });
    } catch ({ code, message, result }) {
      if (code === 11000) {
        res.json({
          duplicates: true,
          insertedNewElement: result.nInserted,
        });

        console.error(message);
      }
    }
  }

  async changePassword(
    email: string,
    obj: ChangePassword,
  ): Promise<ChangePasswordInterface> {
    if (obj.password !== obj.passwordRepeat) {
      throw new HttpException(
        'Password are not the same.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPwd = await hashPassword(obj.password);
    const admin = await this.adminModel.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedPwd,
        },
      },
    );

    return {
      email: admin.email,
      message: 'Successfully updated',
    };
  }

  //

  //HR form
  async addHumanResource(obj: HrDto, res: Response) {
    try {
      const newHr = new this.humanResources({
        name: obj.name,
        lastName: obj.lastname,
        email: obj.email,
        company: obj.company,
      });
      const data = await newHr.save();

      const { token } = await this.createTokenAndSendEmail(
        { email: newHr.email, id: newHr._id.toString() },
        process.env.REGISTER_TOKEN_USER,
      );

      newHr.registerToken = token;
      await newHr.save();

      return res.json({
        id: data._id,
        email: data.email,
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

  // log admin -> zmienić DAĆ DO AUTH
  async login(email: string, password: string) {
    const admin = await this.adminModel.findOne({
      email,
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    const checkPassword = await verifyPassword(password, admin.password);

    if (checkPassword === false) {
      throw new Error('Password is incorrect');
    }

    if (admin && checkPassword) {
      admin.token = sign({ email: admin.email }, process.env.ADMIN_TOKEN_LOGIN);
      return {
        id: admin._id,
        email: admin.email,
      };
    }
  }

  private async createTokenAndSendEmail(payload: Payload, secret: string) {
    const token = sign({ email: payload.email, id: payload.id }, secret, {
      expiresIn: '24h',
    });
    const checkTokenValid = verify(token, secret);
    if (checkTokenValid) {
      await this.emailService.sendEmail(
        payload.email,
        'Register',
        `Click link to register. + ${payload.id} + ${token}`,
      );
    } else {
      throw new Error('Token is not valid anymore');
    }

    return {
      payload,
      secret,
      token,
    };
  }
}

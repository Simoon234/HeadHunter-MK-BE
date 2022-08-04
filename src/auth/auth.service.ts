import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { LogDto } from './dto/log.dto';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import { sign } from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword } from '../utils/hashPassword';
import { HumanResources } from 'src/schemas/hr.schema';
import { EmailService } from '../email/email.service';
import { Role } from '../types';
import { Admin } from '../schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(HumanResources.name) private hr: Model<HumanResources>,
    @Inject(EmailService) private mailService: EmailService,
    @InjectModel(Admin.name) private admin: Model<Admin>,
  ) {}

  private static createToken(
    currentTokenId: string,
    id: string,
  ): {
    accessToken: string;
    expiresIn: number;
  } {
    const payload: { id: string; userId: string } = {
      id: currentTokenId,
      userId: id,
    };
    const expiresIn = 60 * 60 * 24;
    const accessToken = sign(payload, process.env.LOG_TOKEN, {
      expiresIn,
    });

    return {
      accessToken,
      expiresIn,
    };
  }

  async login(req: LogDto, res: Response) {
    const { email, password } = req;

    try {
      const users = await this.user.find({ email }).exec();
      const hr = await this.hr.find({ email }).exec();
      const admins = await this.admin.find({ email }).exec();

      const [user] = [...users, ...hr, ...admins];

      if (!user) {
        throw new Error('User not Found');
      }

      const pwd = await verifyPassword(password, user.password);

      if (!pwd) {
        throw new Error('Incorrect password');
      }

      const id = String(user._id);
      const token = AuthService.createToken(await this.generateToken(user), id);

      res
        .cookie('jwt', token.accessToken, {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
        })
        .json({
          success: true,
          user: {
            id: user._id,
            email: user.email,
            firstName:
              user.role !== Role.HR
                ? user.role !== Role.ADMIN
                  ? user?.firstName
                  : ''
                : '',
            lastName: user.role === Role.ADMIN ? '' : user?.lastName,
            role: user.role,
          },
        });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }
  async registerHr(
    id: string,
    registerToken: string,
    obj: RegisterDto,
    res: Response,
  ) {
    try {
      if (obj.password !== obj.passwordRepeat) {
        res.json({
          message: 'Passwords are not the same',
        });
      }

      const hashPwd = await hashPassword(obj.password);

      await this.hr.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } },
      );

      const get = await this.hr.findById({ _id: id });
      if (get.registerToken === null && get.active === true) {
        res.json({
          message: 'You are already registered',
        });
      }

      return res.json({
        registeredId: get._id,
        success: true,
      });
    } catch (err) {
      res.json({
        message: err.message,
      });
      console.error(err);
    }
  }

  async registerUser(
    id: string,
    registerToken: string,
    obj: RegisterDto,
    res: Response,
  ) {
    try {
      if (obj.password !== obj.passwordRepeat) {
        res.json({
          message: 'Passwords are not the same',
        });
      }

      const hashPwd = await hashPassword(obj.password);

      await this.user.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } },
      );

      const get = await this.user.findById({ _id: id });

      if (get.registerToken === null && get.active === true) {
        res.json({
          message: 'You are already registered',
        });
      } else {
        res.json({
          registeredId: get._id,
          success: true,
        });
      }
    } catch (err) {
      res.json({
        message: err.message,
      });
      console.error(err);
    }
  }

  async checkAuth(person, res: Response) {
    res.json({ success: true, role: person.role });
  }

  async logout(person, res: Response) {
    try {
      person.accessToken = null;
      await person.save();
      return res
        .clearCookie('jwt', {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
        })
        .json({
          success: true,
        });
    } catch (err) {
      res.json({
        success: false,
      });
    }
  }

  async remindPassword(email: string) {
    const user = await this.user.findOne({ email });

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    if (!user.email) {
      throw new HttpException(
        `No user with that: (${email}) email`,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.refreshToken = sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_REMINDER,
      {
        expiresIn: '1h',
      },
    );
    await user.save();

    await this.mailService.sendEmail(
      user.email,
      'Password reset',
      `<p>Click <a href="ERROR">here</a> to reset your password</p>`,
    );

    return {
      message: 'Check your email address.',
    };
  }

  private async generateToken(obj): Promise<string> {
    let token: string;
    let refreshToken: string;
    const personWithTheSameToken = null;

    do {
      token = uuid();
      refreshToken = uuid();
    } while (!!personWithTheSameToken);

    obj.accessToken = token;
    obj.refreshToken = refreshToken;
    await obj.save();
    return token;
  }
}

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
import { resetPassword } from '../templates/email/passwordReset';

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

      let resUser: any = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      if (user.role === Role.ADMIN) {
        resUser = { ...resUser };
      }

      if (user.role === Role.HR) {
        resUser = {
          ...resUser,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
        };
      }

      if (user.role === Role.STUDENT) {
        resUser = {
          ...resUser,
          firstName: user.firstName,
          lastName: user.lastName,
          tel: user.tel,
          githubUsername: user.githubUsername,
          bio: user.bio,
          courseCompletion: user.courseCompletion,
          courseEngagement: user.courseEngagement,
          projectDegree: user.projectDegree,
          teamProjectDegree: user.teamProjectDegree,
          expectedTypeWork: user.expectedTypeWork,
          expectedContractType: user.expectedContractType,
          monthsOfCommercialExp: user.monthsOfCommercialExp,
          targetWorkCity: user.targetWorkCity,
          expectedSalary: user.expectedSalary,
          canTakeApprenticeship: user.canTakeApprenticeship,
          education: user.education,
          courses: user.courses,
          workExperience: user.workExperience,
          portfolioUrls: user.portfolioUrls,
          scrumUrls: user.scrumUrls,
          projectUrls: user.projectUrls,
          firstLogin: user.firstLogin,
        };
      }

      res
        .cookie('jwt', token.accessToken, {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
        })
        .json({
          success: true,
          user: resUser,
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
      const get = await this.hr.findById({ _id: id });
      if (get.registerToken === null && get.active === true) {
        throw new Error('You already registered');
      }

      if (obj.password !== obj.passwordRepeat) {
        throw new Error('Password is not the same');
      }

      const hashPwd = await hashPassword(obj.password);

      await this.hr.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } },
      );

      return res.json({
        registeredId: get._id,
        success: true,
      });
    } catch (err) {
      res.json({
        success: false,
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
      const get = await this.user.findById({ _id: id });
      if (get.registerToken === null && get.active === true) {
        throw new Error('You already registered');
      }

      if (obj.password !== obj.passwordRepeat) {
        throw new Error('Password is not the same');
      }

      const hashPwd = await hashPassword(obj.password);

      await this.user.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } },
      );

      res.json({
        registeredId: get._id,
        success: true,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.message,
      });
      console.error(err);
    }
  }

  async checkAuth(person, res: Response) {
    try {
      let user;
      let resUser;
      if (person.role === Role.ADMIN) {
        user = await this.admin.findOne({ _id: person.id }).exec();
        resUser = {
          email: user[0].email,
        };
      }

      if (person.role === Role.HR) {
        user = await this.hr.find({ _id: person.id }).exec();
        resUser = {
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          tel: user[0].tel,
          company: user[0].company,
        };
      }

      if (person.role === Role.STUDENT) {
        user = await this.user.find({ _id: person.id }).exec();
        resUser = {
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          tel: user[0].tel,
          githubUsername: user[0].githubUsername,
          bio: user[0].bio,
          courseCompletion: user[0].courseCompletion,
          courseEngagement: user[0].courseEngagement,
          projectDegree: user[0].projectDegree,
          teamProjectDegree: user[0].teamProjectDegree,
          expectedTypeWork: user[0].expectedTypeWork,
          expectedContractType: user[0].expectedContractType,
          monthsOfCommercialExp: user[0].monthsOfCommercialExp,
          targetWorkCity: user[0].targetWorkCity,
          expectedSalary: user[0].expectedSalary,
          canTakeApprenticeship: user[0].canTakeApprenticeship,
          education: user[0].education,
          courses: user[0].courses,
          workExperience: user[0].workExperience,
          portfolioUrls: user[0].portfolioUrls,
          scrumUrls: user[0].scrumUrls,
          projectUrls: user[0].projectUrls,
          firstLogin: user[0].firstLogin,
        };
      }

      res.json({
        success: true,
        role: person.role,
        id: person.id,
        user: resUser,
      });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
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

    console.log(user);

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
      process.env.ADMIN_EMAIL,
      '[NO-REPLY] Password reset',
      resetPassword(
        user.firstName === null ? '' : user.firstName,
        user._id.toString(),
        user.refreshToken,
      ),
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

  async changePassword(id: string, refreshToken: string, password: string) {
    const users = await this.user.find({ _id: id }).exec();
    const hr = await this.hr.find({ _id: id }).exec();
    const admins = await this.admin.find({ _id: id }).exec();

    const [user] = [...users, ...hr, ...admins];

    if (!user) {
      throw new HttpException('User not exist', HttpStatus.BAD_REQUEST);
    }

    user.password = await hashPassword(password);
    user.refreshToken = null;
    user.accessToken = null;
    await user.save();

    return {
      success: true,
      message: 'Password changed.',
    };
  }
}

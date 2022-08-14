import { Inject, Injectable } from '@nestjs/common';
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
import { Person, Role, TokenGenerator } from '../types';
import { Admin } from '../schemas/admin.schema';
import { resetPassword } from '../templates/email/passwordReset';
import { sendError } from '../utils/sendError';
import { ADMIN_EMAIL, LOG_TOKEN, REFRESH_TOKEN_REMINDER } from '../config';

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
  ): TokenGenerator {
    const payload: { id: string; userId: string } = {
      id: currentTokenId,
      userId: id,
    };
    const expiresIn = 60 * 60 * 24;
    const accessToken = sign(payload, LOG_TOKEN, {
      expiresIn,
    });

    return {
      accessToken,
      expiresIn,
    };
  }

  private static async generateToken(obj): Promise<string> {
    const token = uuid();
    const refreshToken = uuid();

    obj.accessToken = token;
    obj.refreshToken = refreshToken;
    await obj.save();
    return token;
  }

  private static loginUserHandler(student: User) {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      tel: student.tel,
      githubUsername: student.githubUsername,
      bio: student.bio,
      courseCompletion: student.courseCompletion,
      courseEngagement: student.courseEngagement,
      projectDegree: student.projectDegree,
      teamProjectDegree: student.teamProjectDegree,
      expectedTypeWork: student.expectedTypeWork,
      expectedContractType: student.expectedContractType,
      monthsOfCommercialExp: student.monthsOfCommercialExp,
      targetWorkCity: student.targetWorkCity,
      expectedSalary: student.expectedSalary,
      canTakeApprenticeship: student.canTakeApprenticeship,
      education: student.education,
      courses: student.courses,
      workExperience: student.workExperience,
      portfolioUrls: student.portfolioUrls,
      scrumUrls: student.scrumUrls,
      projectUrls: student.projectUrls,
      firstLogin: student.firstLogin,
    };
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
        sendError('Jesteś już zarejestrowny');
      }

      if (obj.password !== obj.passwordRepeat) {
        sendError('Hasła nie są takie same');
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
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  private static checkAuthHandler(student) {
    return {
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      tel: student.tel,
      githubUsername: student.githubUsername,
      bio: student.bio,
      courseCompletion: student.courseCompletion,
      courseEngagement: student.courseEngagement,
      projectDegree: student.projectDegree,
      teamProjectDegree: student.teamProjectDegree,
      expectedTypeWork: student.expectedTypeWork,
      expectedContractType: student.expectedContractType,
      monthsOfCommercialExp: student.monthsOfCommercialExp,
      targetWorkCity: student.targetWorkCity,
      expectedSalary: student.expectedSalary,
      canTakeApprenticeship: student.canTakeApprenticeship,
      education: student.education,
      courses: student.courses,
      workExperience: student.workExperience,
      portfolioUrls: student.portfolioUrls,
      scrumUrls: student.scrumUrls,
      projectUrls: student.projectUrls,
      firstLogin: student.firstLogin,
    };
  }

  async login(req: LogDto, res: Response): Promise<void> {
    const { email, password } = req;

    try {
      const users = await this.user.find({ email, active: true }).exec();
      const hr = await this.hr.find({ email, active: true }).exec();
      const admins = await this.admin.find({ email }).exec();

      const [user] = [...users, ...hr, ...admins];

      if (!user) {
        sendError('Nie znaleziono użytkownika o podanym adresie email');
      }

      const pwd = await verifyPassword(password, user.password);

      if (!pwd) {
        sendError('Nieprawidłowe hasło');
      }

      const id = String(user._id);
      const token = AuthService.createToken(
        await AuthService.generateToken(user),
        id,
      );

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
          ...AuthService.loginUserHandler(user),
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
  ): Promise<void> {
    try {
      const get = await this.hr.findById({ _id: id });
      if (get.registerToken === null && get.active === true) {
        sendError('Jesteś już zarejestrowany');
      }

      if (obj.password !== obj.passwordRepeat) {
        sendError('Hasła nie są takie same');
      }

      const hashPwd = await hashPassword(obj.password);

      await this.hr.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } },
      );

      res.json({
        registeredId: get._id,
        success: true,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async checkAuth(person: Person, res: Response) {
    try {
      let user;
      let resUser;
      if (person.role === Role.ADMIN) {
        user = await this.admin.find({ _id: person.id }).exec();
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
          id: user[0].id,
          company: user[0].company,
        };
      }

      if (person.role === Role.STUDENT) {
        user = await this.user.find({ _id: person.id }).exec();
        resUser = {
          ...AuthService.checkAuthHandler(user[0]),
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
      res
        .clearCookie('jwt', {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
        })
        .json({
          success: true,
        });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async remindPassword(email: string, res: Response): Promise<void> {
    try {
      const user = await this.user.find().exec();
      const hr = await this.user.find().exec();
      const admin = await this.user.find().exec();

      const allUsers = [...user, ...hr, ...admin].find(
        (user) => user.email === email,
      );

      if (!allUsers) {
        sendError('Brak użytkownika o podanym adresie email');
      }

      allUsers.refreshToken = sign(
        { email: allUsers.email },
        REFRESH_TOKEN_REMINDER,
        {
          expiresIn: '1h',
        },
      );
      await allUsers.save();

      await this.mailService.sendEmail(
        allUsers.email,
        ADMIN_EMAIL,
        '[NO-REPLY] Password reset',
        resetPassword(
          allUsers.firstName === null ? '' : allUsers.firstName,
          allUsers._id.toString(),
          allUsers.refreshToken,
        ),
      );

      res.json({ success: true });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  async changePassword(
    id: string,
    refreshToken: string,
    password: string,
    res: Response,
  ): Promise<void> {
    try {
      const users = await this.user.find({ _id: id }).exec();
      const hr = await this.hr.find({ _id: id }).exec();
      const admins = await this.admin.find({ _id: id }).exec();

      const [user] = [...users, ...hr, ...admins];

      if (!user) {
        sendError('Nie ma takiego użytkownika');
      }

      user.password = await hashPassword(password);
      user.refreshToken = null;
      user.accessToken = null;
      await user.save();

      res.json({ success: true });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }
}

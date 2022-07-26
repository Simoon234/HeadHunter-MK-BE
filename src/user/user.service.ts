import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from '../types';
import { UserUpdateDto } from './dto/user.update.dto';
import { Response } from 'express';
import { User } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';
import { hashPassword } from '../utils/hashPassword';
import { HumanResources } from '../schemas/hr.schema';
import { sendError } from '../utils/sendError';
import { ADMIN_EMAIL } from 'src/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(HumanResources.name) private hrModule: Model<HumanResources>,
    @Inject(EmailService) private emailService: EmailService,
  ) {}

  async userFoundJob(id: string, res: Response): Promise<void> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { _id: id },
        { $set: { status: Status.HIRED, active: false, accessToken: null } },
      );

      const allHr = await this.hrModule.find({});
      allHr.map(async (item) => {
        item.users = item.users.filter((userId) => userId.toString() !== id);
        await item.save();
      });

      if (!user) {
        sendError('Nie znaleziono użytkownika');
      }

      await this.emailService.sendEmail(
        ADMIN_EMAIL,
        ADMIN_EMAIL,
        '[MegaK HeadHunters] Student find job',
        `User with ${id} got job!`,
      );

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
      if (e) {
        res.status(404);
        res.json({
          message: e.message,
          success: false,
        });
      }
    }
  }

  async updateUserAfterLogin(
    id: string,
    res: Response,
    {
      bio,
      education,
      email,
      expectedContractType,
      expectedSalary,
      expectedTypeWork,
      firstName,
      githubUsername,
      lastName,
      monthsOfCommercialExp,
      targetWorkCity,
      tel,
      courses,
      workExperience,
      canTakeApprenticeship,
      projectUrls,
      portfolioUrls,
      scrumUrls,
      password,
      passwordRepeat,
    }: UserUpdateDto,
  ): Promise<void> {
    try {
      const findUser = await this.userModel.findOne({ _id: id });
      const getAllUsers = (await this.userModel.find().exec()).filter(
        (user) => user.email !== findUser.email,
      );
      let hashPwd = '';

      for (const user of getAllUsers) {
        if (user.email === email) {
          sendError('Podany adres email istnieje w bazie danych');
        }
      }

      if (password.length !== 0) {
        if (password !== passwordRepeat) {
          sendError('Hasła nie są takie same');
        }
        hashPwd = await hashPassword(password);
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            firstName,
            lastName,
            tel,
            email,
            githubUsername,
            bio,
            expectedTypeWork,
            targetWorkCity,
            expectedContractType,
            expectedSalary,
            monthsOfCommercialExp,
            canTakeApprenticeship,
            education,
            courses,
            workExperience,
            portfolioUrls,
            projectUrls,
            scrumUrls,
            firstLogin: false,
            password: hashPwd.length !== 0 ? hashPwd : findUser.password,
          },
        },
      );

      res.json({
        success: true,
        user: {
          id,
          firstName,
          lastName,
          email,
          tel,
          githubUsername,
          bio,
          courseCompletion: updatedUser.courseCompletion,
          courseEngagement: updatedUser.courseEngagement,
          projectDegree: updatedUser.projectDegree,
          teamProjectDegree: updatedUser.teamProjectDegree,
          expectedTypeWork,
          expectedContractType,
          monthsOfCommercialExp,
          targetWorkCity,
          expectedSalary,
          canTakeApprenticeship,
          education,
          courses,
          workExperience,
          portfolioUrls,
          scrumUrls,
          projectUrls,
          firstLogin: updatedUser.firstLogin,
        },
      });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  async getSingleUserCV(id: string, res: Response): Promise<void> {
    try {
      const user = await this.userModel.findOne({ _id: id });

      if (!user) {
        sendError('Nie ma użytkownika o podanym ID');
      }

      res.json({
        success: true,
        user,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async deleteAccount(id: string, res: Response): Promise<void> {
    try {
      await this.userModel.deleteOne({ _id: id });

      res.json({
        success: true,
      });
    } catch (e) {
      res.json({
        message: e.message,
        status: false,
      });
    }
  }
}

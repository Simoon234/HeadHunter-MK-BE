import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status, UserFilterInterface } from '../types';
import { UserUpdateDto } from './dto/user.update.dto';
import { Response } from 'express';
import { User } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';
import { hashPassword } from '../utils/hashPassword';
import { HumanResources } from '../schemas/hr.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(HumanResources.name) private hrModule: Model<HumanResources>,
    @Inject(EmailService) private emailService: EmailService,
  ) {}

  //PAGINATION
  async getAllActiveUsers(itemsOnPage: number, page: number, res: Response) {
    try {
      const maxItemsOnPage = itemsOnPage;
      const currentPage = page;
      const countElement = await this.userModel.count({
        status: Status.ACTIVE,
        active: true,
        firstLogin: false,
      });
      const getAllActiveUsers = await this.userModel
        .find({
          status: Status.ACTIVE,
          active: true,
          firstLogin: false,
        })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const totalPages = Math.round(countElement / maxItemsOnPage);

      const usersRes = getAllActiveUsers.map((item) => {
        return {
          id: item.id,
          email: item.email,
          firstName: item.firstName,
          lastName: item.lastName,
          tel: item.tel,
          githubUsername: item.githubUsername,
          bio: item.bio,
          courseCompletion: item.courseCompletion,
          courseEngagement: item.courseEngagement,
          projectDegree: item.projectDegree,
          teamProjectDegree: item.teamProjectDegree,
          expectedTypeWork: item.expectedTypeWork,
          expectedContractType: item.expectedContractType,
          monthsOfCommercialExp: item.monthsOfCommercialExp,
          targetWorkCity: item.targetWorkCity,
          expectedSalary: item.expectedSalary,
          canTakeApprenticeship: item.canTakeApprenticeship,
          education: item.education,
          courses: item.courses,
          workExperience: item.workExperience,
          portfolioUrls: item.portfolioUrls,
          scrumUrls: item.scrumUrls,
          projectUrls: item.projectUrls,
          firstLogin: item.firstLogin,
        };
      });

      res.json({
        success: true,
        users: usersRes,
        pages: totalPages,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  //TYLKO USER ROLA USER useGuard()
  async userFoundJob(id: string, res: Response) {
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
        throw new Error('Nie znaleziono użytkownika');
      }

      await this.emailService.sendEmail(
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_EMAIL,
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

  //Update
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
  ) {
    try {
      const findUser = await this.userModel.findOne({ _id: id });
      const getAllUsers = (await this.userModel.find().exec()).filter(
        (user) => user.email !== findUser.email,
      );
      let hashPwd = '';

      for (const user of getAllUsers) {
        if (user.email === email) {
          throw new Error('Podany adres email istnieje w bazie danych');
        }
      }

      if (password.length !== 0) {
        if (password !== passwordRepeat) {
          throw new Error('Hasła nie są takie same');
        }
        hashPwd = await hashPassword(password);
      }

      //UPDATE USER
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

  //AVATAR URL SCHEMA CREATE!
  async getSingleUserCV(id: string, res: Response) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      res.json({
        user: user === null ? 'User not found' : user,
      });
    } catch (e) {
      if (e) {
        res.json({
          message: 'Incorrect id',
          defaultMessage: e.message,
        });
      }
      console.error(e);
    }
  }

  async deleteAccount(id: string, res: Response) {
    try {
      const user = await this.userModel.deleteOne({ _id: id });

      if (user.deletedCount <= 0) {
        return res.status(404).json({
          message: 'User with that ID was deleted',
        });
      }

      res.status(204).json({
        message: `User with id ${id} has been deleted`,
        success: true,
      });
    } catch (e) {
      if (e) {
        res.status(400);
        res.json({
          message: 'Invalid id',
          status: false,
        });
      }
    }
  }
}

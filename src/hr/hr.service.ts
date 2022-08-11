import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HumanResources } from '../schemas/hr.schema';
import { sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { User } from '../schemas/user.schema';
import {Status, UserFilterInterface} from '../types';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';
import { hashPassword } from '../utils/hashPassword';
import { HrUpdateDto } from './dto/hr-update.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class HrService {
  constructor(
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>,
    @InjectModel(User.name) private user: Model<User>,
    @Inject(EmailService) private emailService: EmailService,
  ) {}

  async getAllActiveUsers(
    id: string,
    itemsOnPage: number,
    page: number,
    res: Response,
  ) {
    try {
      const hr = await this.humanResources.findOne({ _id: id });
      const hrStudentsId = hr.users.map((item) => item.toString());

      const maxItemsOnPage = itemsOnPage;
      const currentPage = page;

      const getAllActiveStudents = await this.user
        .find({
          status: Status.ACTIVE,
          active: true,
          firstLogin: false,
        })
        .exec();

      const countElement = getAllActiveStudents.length;

      const activeStudentsId = getAllActiveStudents
        .filter((student) => !hrStudentsId.includes(student._id.toString()))
        .map((el) => el._id.toString());

      const getPaginationStudents = await this.user
        .find({
          $and: [
            { status: Status.ACTIVE, active: true, firstLogin: false },
            {
              _id: { $in: activeStudentsId },
            },
          ],
        })
        .sort({ lastName: 1, firstName: 1 })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const totalPages = Math.round(
        (countElement - hr.users.length) / maxItemsOnPage,
      );

      const usersRes = getPaginationStudents.map((item) => {
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

  async addToTalk(id: string, userId: string, res: Response) {
    try {
      const hr = await this.humanResources.findById({
        _id: id,
      });

      const addUserToTalk = await this.user.findOne({ _id: userId });

      if (
        addUserToTalk.status !== Status.ACTIVE ||
        addUserToTalk.active === false
      ) {
        throw new Error('Użytkownik nie jest aktywny');
      }
      const token = sign(
        { email: addUserToTalk.email },
        process.env.TOKEN_ADDED_USER_HR,
      );

      await this.user.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            addedByHr: token,
          },
        },
      );

      hr.users.map((item) => {
        if (item.toString() === userId) {
          throw new Error(
            'Próbujesz dodać użytkownika, który jest już dodany do twojej listy',
          );
        }
      });

      hr.users.push(addUserToTalk);
      await hr.save();

      res.json({
        success: true,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  // w parametrze przekażemy hr (req.user) i stamtąd wezmiemy id
  async usersAddedToTalkByCurrentHr(id, itemsOnPage, page, res) {
    try {
      const hr = await this.humanResources.findById({
        _id: id,
      });
      const users = hr.users;

      if (users === null) {
        throw new Error('Brak kursantów');
      }

      const convertToString = users.map((item) => item.toString());

      const maxItemsOnPage = itemsOnPage;
      const currentPage = page;

      const usersAdded = await this.user
        .find()
        .where('_id')
        .in(convertToString)
        .exec();

      const countElement = usersAdded.length;

      const getStudents = await this.user
        .find()
        .where('_id')
        .in(convertToString)
        .sort({ lastName: 1, firstName: 1 })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const totalPages = Math.round(countElement / maxItemsOnPage);

      const usersRes = getStudents.map((item) => {
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

      // usersAdded.map(async (item) => {
      //   const token = item.addedByHr;
      //   // await this.checkToken(token, process.env.TOKEN_ADDED_USER_HR, item, hr);
      // });

      res.json({ success: true, users: usersRes, pages: totalPages });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  // @Cron(CronExpression.EVERY_2_HOURS)
  // async checkToken(token, env, item, hr) {
  //   verify(token, env, async (err) => {
  //     if (err instanceof TokenExpiredError) {
  //       item.addedByHr = null;
  //       item.dateAdded = null;
  //       await item.save();
  //
  //       hr.users = hr.users.filter(
  //         (id) => id.toString() !== item._id.toString(),
  //       );
  //       await hr.save();
  //     }
  //   });
  //
  //   return {
  //     token,
  //     env,
  //     item,
  //   };
  // }

  async notInterested(userId: string, hrId: string, res: Response) {
    try {
      await this.user.findOneAndUpdate(
        { _id: userId },
        { $set: { addedByHr: null, dateAdded: null } },
      );

      const hr = await this.humanResources.findById({
        _id: hrId,
      });
      hr.users = hr.users.filter((id) => id.toString() !== userId);
      await hr.save();

      res.json({
        success: true,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async update(id: string, obj: HrUpdateDto, res: Response): Promise<void> {
    try {
      const findUser = await this.humanResources.findOne({ _id: id });
      let hashPwd = '';

      if (obj.password) {
        if (obj.password !== obj.passwordRepeat) {
          throw new Error('Hasła nie są takie same');
        }
        hashPwd = await hashPassword(obj.password);
      }

      findUser.firstName = obj.firstName;
      findUser.lastName = obj.lastName;
      findUser.email = obj.email;
      findUser.company = obj.company;
      findUser.password = hashPwd !== '' ? hashPwd : findUser.password;

      await findUser.save();

      res.json({
        success: true,
        user: {
          id: id,
          firstName: obj.firstName,
          lastName: obj.lastName,
          email: obj.email,
          company: obj.company,
        },
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async userFoundJob(id: string, res: Response) {
    try {
      const user = await this.user.findOneAndUpdate(
        { _id: id },
        { $set: { status: Status.HIRED, active: false, accessToken: null } },
      );

      if (!user) {
        throw new Error('Nie znaleziono użytkownika');
      }

      const allHr = await this.humanResources.find({});
      allHr.map(async (item) => {
        item.users = item.users.filter((userId) => userId.toString() !== id);
        await item.save();
      });

      await this.emailService.sendEmail(
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_EMAIL,
        '[MegaK HeadHunters] Student find job',
        `User with ${id} got job!`,
      );

      res.json({
        success: true,
      });
    } catch (e) {
      res.json({
        message: e.message,
        success: false,
      });
    }
  }

  //filter data ERROR WITH OD DO SALARY
  async filterUsers(query) {
    const all = await this.user.find().exec();
    return all.filter((user) => {
      let isValid = true;
      for (let key in query) {
        console.log({query})
        isValid = isValid && user[key] == query[key];
      }
      return isValid;
    });
  }
}

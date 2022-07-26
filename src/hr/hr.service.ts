import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HumanResources } from '../schemas/hr.schema';
import { sign } from 'jsonwebtoken';
import { User } from '../schemas/user.schema';
import { ContractType, Grade, Status, WorkType } from '../types';
import { Response } from 'express';
import { hashPassword } from '../utils/hashPassword';
import { HrUpdateDto } from './dto/hr-update.dto';
import { EmailService } from '../email/email.service';
import { checkQueryUrl } from '../utils/checkQueryUrl';
import { ADMIN_EMAIL, TOKEN_ADDED_USER_HR } from '../config';
import { usersResponseAvailable } from 'src/utils/usersResponseAvailable';
import { sendError } from '../utils/sendError';
import { usersResponseToTalk } from 'src/utils/usersResponseToTalk';

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
  ): Promise<void> {
    try {
      let maxItemsOnPage = itemsOnPage;
      let currentPage = page;

      if (page === 0) {
        currentPage = 1;
      }

      if (itemsOnPage === 0) {
        maxItemsOnPage = 1;
      }

      const hr = await this.humanResources.findOne({ _id: id });
      const hrStudentsId = hr.users.map((item) => item.toString());

      const getAllActiveStudents = await this.user
        .find({
          status: Status.ACTIVE,
          active: true,
          firstLogin: false,
        })
        .exec();

      const countElement = getAllActiveStudents.length;

      const activeStudentsId = getAllActiveStudents
        .filter((student) => !hrStudentsId.includes(student.id))
        .map((el) => el.id);

      const getAllStudents = (
        await this.user.find({
          $and: [
            { status: Status.ACTIVE, active: true, firstLogin: false },
            {
              _id: { $in: activeStudentsId },
            },
          ],
        })
      ).map((item) => {
        return {
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
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
        };
      });

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

      const totalPages = Math.ceil(
        (countElement - hr.users.length) / maxItemsOnPage,
      );

      res.json({
        success: true,
        students: usersResponseAvailable(getPaginationStudents),
        allStudents: getAllStudents,
        pages: totalPages,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async addToTalk(id: string, userId: string, res: Response): Promise<void> {
    try {
      const hr = await this.humanResources.findById({
        _id: id,
      });

      if (hr.maxStudents <= hr.users.length) {
        sendError(
          `Maksymalna liczba kursantów w panelu "Do rozmowy" nie może być większa od ${hr.maxStudents}`,
        );
      }

      const addUserToTalk = await this.user.findOne({ _id: userId });

      if (
        addUserToTalk.status !== Status.ACTIVE ||
        addUserToTalk.active === false
      ) {
        sendError('Użytkownik nie jest aktywny');
      }
      const token = sign({ email: addUserToTalk.email }, TOKEN_ADDED_USER_HR);

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
          sendError(
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

  async usersAddedToTalkByCurrentHr(id, itemsOnPage, page, res): Promise<void> {
    try {
      let maxItemsOnPage = itemsOnPage;
      let currentPage = page;

      if (page === 0) {
        currentPage = 1;
      }

      if (itemsOnPage === 0) {
        maxItemsOnPage = 1;
      }

      const hr = await this.humanResources.findById({
        _id: id,
      });
      const users = hr.users;

      if (users === null) {
        sendError('Brak kursantów');
      }

      const convertToString = users.map((item) => item.toString());

      const usersAdded = (
        await this.user.find().where('_id').in(convertToString).exec()
      ).map((item) => {
        return {
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          githubUsername: item.githubUsername,
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
        };
      });

      const countElement = usersAdded.length;

      const getStudents = await this.user
        .find()
        .where('_id')
        .in(convertToString)
        .sort({ lastName: 1, firstName: 1 })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const totalPages = Math.ceil(countElement / maxItemsOnPage);

      res.json({
        success: true,
        students: usersResponseToTalk(getStudents),
        allStudents: usersAdded,
        pages: totalPages,
      });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  async notInterested(
    userId: string,
    hrId: string,
    res: Response,
  ): Promise<void> {
    try {
      await this.user.findOneAndUpdate(
        { _id: userId },
        { $set: { addedByHr: null } },
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

  async update(id: string, obj: HrUpdateDto, res: Response) {
    try {
      const findUser = await this.humanResources.findOne({ _id: id });
      let hashPwd = '';

      if (obj.password) {
        if (obj.password !== obj.passwordRepeat) {
          sendError('Hasła nie są takie same');
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
      console.log(e);
      res.json({
        success: false,
        message: e.message,
      });
    }
  }

  async userFoundJob(id: string, res: Response): Promise<void> {
    try {
      const user = await this.user.findOneAndUpdate(
        { _id: id },
        { $set: { status: Status.HIRED, active: false, accessToken: null } },
      );

      if (!user) {
        sendError('Nie znaleziono użytkownika');
      }

      const allHr = await this.humanResources.find({});
      allHr.map(async (item) => {
        item.users = item.users.filter((userId) => userId.toString() !== id);
        await item.save();
      });

      await this.emailService.sendEmail(
        ADMIN_EMAIL,
        ADMIN_EMAIL,
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

  async filterAvailableStudents(
    query: any,
    page: number,
    itemsOnPage: number,
    id: string,
    res: Response,
  ): Promise<void> {
    try {
      const WORK_TYPE = Object.values(WorkType);
      const GRADE = Object.values(Grade);
      const CONTRACT_TYPE = Object.values(ContractType);

      const courseCompletion = checkQueryUrl(query.courseCompletion);
      const courseEngagement = checkQueryUrl(query.courseEngagement);
      const projectDegree = checkQueryUrl(query.projectDegree);
      const teamProjectDegree = checkQueryUrl(query.teamProjectDegree);
      const expectedTypeWork = checkQueryUrl(query.expectedTypeWork);
      const expectedContractType = checkQueryUrl(query.expectedContractType);

      const hr = await this.humanResources.findOne({ _id: id });
      const hrStudentsId = hr.users.map((item) => item.toString());

      let maxItemsOnPage = itemsOnPage;
      let currentPage = page;

      if (page === 0) {
        currentPage = 1;
      }

      if (itemsOnPage === 0) {
        maxItemsOnPage = 1;
      }

      const getAllActiveStudents = await this.user
        .find({
          $and: [
            {
              status: Status.ACTIVE,
              active: true,
              firstLogin: false,
            },
            {
              courseCompletion: {
                $in: courseCompletion ? courseCompletion : GRADE,
              },
            },
            {
              courseEngagement: {
                $in: courseEngagement ? courseEngagement : GRADE,
              },
            },
            {
              projectDegree: { $in: projectDegree ? projectDegree : GRADE },
            },
            {
              teamProjectDegree: {
                $in: teamProjectDegree ? teamProjectDegree : GRADE,
              },
            },
            {
              expectedTypeWork: {
                $in: expectedTypeWork ? expectedTypeWork : WORK_TYPE,
              },
            },
            {
              expectedContractType: {
                $in: expectedContractType
                  ? expectedContractType
                  : CONTRACT_TYPE,
              },
            },
            { canTakeApprenticeship: query.canTakeApprenticeship },
            {
              monthsOfCommercialExp:
                !query.monthsOfCommercialExp || query.monthsOfCommercialExp < 0
                  ? { $gte: 0 }
                  : { $gte: query.monthsOfCommercialExp },
            },
            {
              expectedSalary: {
                $gte: query.expectedSalaryFrom ? query.expectedSalaryFrom : 0,
                $lte: query.expectedSalaryTo ? query.expectedSalaryTo : 0,
              },
            },
          ],
        })
        .exec();

      const countElement = getAllActiveStudents.length;

      const activeStudentsId = getAllActiveStudents
        .filter((student) => !hrStudentsId.includes(student.id))
        .map((el) => el.id);

      const getAllStudents = (
        await this.user
          .find({
            $and: [
              {
                status: Status.ACTIVE,
                active: true,
                firstLogin: false,
              },
              {
                _id: { $in: activeStudentsId },
              },
              {
                courseCompletion: {
                  $in: courseCompletion ? courseCompletion : GRADE,
                },
              },
              {
                courseEngagement: {
                  $in: courseEngagement ? courseEngagement : GRADE,
                },
              },
              {
                projectDegree: { $in: projectDegree ? projectDegree : GRADE },
              },
              {
                teamProjectDegree: {
                  $in: teamProjectDegree ? teamProjectDegree : GRADE,
                },
              },
              {
                expectedTypeWork: {
                  $in: expectedTypeWork ? expectedTypeWork : WORK_TYPE,
                },
              },
              {
                expectedContractType: {
                  $in: expectedContractType
                    ? expectedContractType
                    : CONTRACT_TYPE,
                },
              },
              { canTakeApprenticeship: query.canTakeApprenticeship },
              {
                monthsOfCommercialExp:
                  !query.monthsOfCommercialExp ||
                  query.monthsOfCommercialExp < 0
                    ? { $gte: 0 }
                    : { $gte: query.monthsOfCommercialExp },
              },
              {
                expectedSalary: {
                  $gte: query.expectedSalaryFrom ? query.expectedSalaryFrom : 0,
                  $lte: query.expectedSalaryTo ? query.expectedSalaryTo : 0,
                },
              },
            ],
          })
          .exec()
      ).map((item) => {
        return {
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
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
        };
      });

      const getPaginationStudents = await this.user
        .find({
          $and: [
            {
              status: Status.ACTIVE,
              active: true,
              firstLogin: false,
            },
            {
              _id: { $in: activeStudentsId },
            },
            {
              courseCompletion: {
                $in: courseCompletion ? courseCompletion : GRADE,
              },
            },
            {
              courseEngagement: {
                $in: courseEngagement ? courseEngagement : GRADE,
              },
            },
            {
              projectDegree: { $in: projectDegree ? projectDegree : GRADE },
            },
            {
              teamProjectDegree: {
                $in: teamProjectDegree ? teamProjectDegree : GRADE,
              },
            },
            {
              expectedTypeWork: {
                $in: expectedTypeWork ? expectedTypeWork : WORK_TYPE,
              },
            },
            {
              expectedContractType: {
                $in: expectedContractType
                  ? expectedContractType
                  : CONTRACT_TYPE,
              },
            },
            { canTakeApprenticeship: query.canTakeApprenticeship },
            {
              monthsOfCommercialExp:
                !query.monthsOfCommercialExp || query.monthsOfCommercialExp < 0
                  ? { $gte: 0 }
                  : { $gte: query.monthsOfCommercialExp },
            },
            {
              expectedSalary: {
                $gte: query.expectedSalaryFrom ? query.expectedSalaryFrom : 0,
                $lte: query.expectedSalaryTo ? query.expectedSalaryTo : 0,
              },
            },
          ],
        })
        .sort({ lastName: 1, firstName: 1 })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const value =
        countElement - hr.users.length <= 0
          ? 1
          : countElement - hr.users.length;

      const totalPages = Math.ceil(value / maxItemsOnPage);

      res.json({
        success: true,
        students: usersResponseAvailable(getPaginationStudents),
        allStudents: getAllStudents,
        pages: totalPages,
      });
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  async filterToTalkStudents(
    query: any,
    page: number,
    itemsOnPage: number,
    id: string,
    res: Response,
  ): Promise<void> {
    try {
      const WORK_TYPE = Object.values(WorkType);
      const GRADE = Object.values(Grade);
      const CONTRACT_TYPE = Object.values(ContractType);

      const courseCompletion = checkQueryUrl(query.courseCompletion);
      const courseEngagement = checkQueryUrl(query.courseEngagement);
      const projectDegree = checkQueryUrl(query.projectDegree);
      const teamProjectDegree = checkQueryUrl(query.teamProjectDegree);
      const expectedTypeWork = checkQueryUrl(query.expectedTypeWork);
      const expectedContractType = checkQueryUrl(query.expectedContractType);

      let maxItemsOnPage = itemsOnPage;
      let currentPage = page;

      if (page === 0) {
        currentPage = 1;
      }

      if (itemsOnPage === 0) {
        maxItemsOnPage = 1;
      }

      const hr = await this.humanResources.findById({
        _id: id,
      });
      const users = hr.users;

      if (users === null) {
        sendError('Brak kursantów');
      }

      const convertToString = users.map((item) => item.toString());

      const usersAdded = (
        await this.user
          .find({
            $and: [
              {
                status: Status.ACTIVE,
                active: true,
                firstLogin: false,
              },
              {
                courseCompletion: {
                  $in: courseCompletion ? courseCompletion : GRADE,
                },
              },
              {
                courseEngagement: {
                  $in: courseEngagement ? courseEngagement : GRADE,
                },
              },
              {
                projectDegree: { $in: projectDegree ? projectDegree : GRADE },
              },
              {
                teamProjectDegree: {
                  $in: teamProjectDegree ? teamProjectDegree : GRADE,
                },
              },
              {
                expectedTypeWork: {
                  $in: expectedTypeWork ? expectedTypeWork : WORK_TYPE,
                },
              },
              {
                expectedContractType: {
                  $in: expectedContractType
                    ? expectedContractType
                    : CONTRACT_TYPE,
                },
              },
              { canTakeApprenticeship: query.canTakeApprenticeship },
              {
                monthsOfCommercialExp:
                  !query.monthsOfCommercialExp ||
                  query.monthsOfCommercialExp < 0
                    ? { $gte: 0 }
                    : { $gte: query.monthsOfCommercialExp },
              },
              {
                expectedSalary: {
                  $gte: query.expectedSalaryFrom ? query.expectedSalaryFrom : 0,
                  $lte: query.expectedSalaryTo ? query.expectedSalaryTo : 0,
                },
              },
            ],
          })
          .where('_id')
          .in(convertToString)
          .exec()
      ).map((item) => {
        return {
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          githubUsername: item.githubUsername,
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
        };
      });

      const countElement = usersAdded.length;

      const getStudents = await this.user
        .find({
          $and: [
            {
              status: Status.ACTIVE,
              active: true,
              firstLogin: false,
            },
            {
              courseCompletion: {
                $in: courseCompletion ? courseCompletion : GRADE,
              },
            },
            {
              courseEngagement: {
                $in: courseEngagement ? courseEngagement : GRADE,
              },
            },
            {
              projectDegree: { $in: projectDegree ? projectDegree : GRADE },
            },
            {
              teamProjectDegree: {
                $in: teamProjectDegree ? teamProjectDegree : GRADE,
              },
            },
            {
              expectedTypeWork: {
                $in: expectedTypeWork ? expectedTypeWork : WORK_TYPE,
              },
            },
            {
              expectedContractType: {
                $in: expectedContractType
                  ? expectedContractType
                  : CONTRACT_TYPE,
              },
            },
            { canTakeApprenticeship: query.canTakeApprenticeship },
            {
              monthsOfCommercialExp:
                !query.monthsOfCommercialExp || query.monthsOfCommercialExp < 0
                  ? { $gte: 0 }
                  : { $gte: query.monthsOfCommercialExp },
            },
            {
              expectedSalary: {
                $gte: query.expectedSalaryFrom ? query.expectedSalaryFrom : 0,
                $lte: query.expectedSalaryTo ? query.expectedSalaryTo : 0,
              },
            },
          ],
        })
        .where('_id')
        .in(convertToString)
        .sort({ lastName: 1, firstName: 1 })
        .skip(maxItemsOnPage * (currentPage - 1))
        .limit(maxItemsOnPage)
        .exec();

      const totalPages = Math.ceil(countElement / maxItemsOnPage);

      res.json({
        success: true,
        students: usersResponseToTalk(getStudents),
        allStudents: usersAdded,
        pages: totalPages,
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message,
      });
    }
  }
}

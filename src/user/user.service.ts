import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Status, SuccessfullyUpdatedUsersInterfaces, UserFilterInterface } from "../types";
import { UserUpdateDto } from "./dto/user.update.dto";
import fetch from "node-fetch";
import { Response } from "express";
import { User } from "../schemas/user.schema";
import { EmailService } from "../email/email.service";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(EmailService) private emailService: EmailService
  ) {
  }

  //PAGINATION
  async getAllActiveUsers(itemsOnPage: number, page: number) {
    const maxItemsOnPage = itemsOnPage;
    const currentPage = page;
    const countElement = await this.userModel.count({
      status: Status.ACTIVE,
      active: true
    });
    const getAllActiveUsers = await this.userModel
      .find({
        status: Status.ACTIVE,
        active: true
      })
      .skip(maxItemsOnPage * (currentPage - 1))
      .limit(maxItemsOnPage)
      .exec();

    const totalPages = Math.round(countElement / maxItemsOnPage);

    return {
      users: getAllActiveUsers.map((item) => {
        return {
          id: item._id,
          courseCompletion: item.courseCompletion,
          courseEngagment: item.courseEngagment,
          projectDegree: item.projectDegree,
          teamProjectDegree: item.teamProjectDegree,
          expectedTypeWork: item.expectedTypeWork,
          expectedContractType: item.expectedContractType,
          expectedSalary: item.expectedSalary,
          canTakeApprenticeship: item.canTakeApprenticeship,
          monthsOfCommercialExp: item.monthsOfCommercialExp,
          targetWorkCity: item.targetWorkCity
        };
      }),
      pages: totalPages
    };
  }

  //TYLKO USER ROLA USER useGuard()
  async userFoundJob(id: string, res: Response) {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { _id: id },
        { $set: { status: Status.HIRED, active: false } }
      );

      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      await this.emailService.sendEmail(
        "admin1@wp.pl",
        "YEAAHH 🔥🔥🔥",
        `User with ${id} got job!`
      );

      res.json({
        updated: true,
        message: `User with ${id} got job.`
      });
    } catch (e) {
      if (e) {
        res.status(404);
        res.json({
          message: "User not found. Make sure you use valid id.",
          status: false
        });
      }
    }
  }

  //Update
  async updateUserAfterLogin(
    id: string,
    {
      bio,
      education,
      email,
      expectedContractType,
      expectedSalary,
      expectedTypeWork,
      firstname,
      githubUsername,
      lastname,
      monthsOfCommercialExp,
      targetWorkCity,
      tel,
      courses,
      workExperience,
      canTakeApprenticeship,
      projectUrls,
      portfolioUrls,
      avatarUrl,
    }: UserUpdateDto,
  ): Promise<SuccessfullyUpdatedUsersInterfaces> {
    const findUser = await this.userModel.findOne({ _id: id });
    const getAllUsers = await this.userModel.find().exec();

    //CHECK IF EMAIL is already set in DB
    for (const user of getAllUsers) {
      if (user.email === email) {
        throw new HttpException(
          `User already exists with that email. (${email})`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    if (githubUsername === "") {
      avatarUrl =
        "https://www.deviantart.com/karmaanddestiny/art/Default-user-icon-4-858661084";
    } else {
      //check GITHUB USERNAME
      const res = await fetch(`https://api.github.com/users/${githubUsername}`);
      if (res.status === 404) {
        throw new HttpException(
          `Github username not exist. Check again username: (${githubUsername})`,
          HttpStatus.NOT_FOUND
        );
      }
      if (res.status === 200) {
        avatarUrl = `https://github.com/${githubUsername}.png`;
      }
    }

    //check values
    if (email === "" || portfolioUrls.length === 0 || targetWorkCity === "") {
      email = findUser.email;
      portfolioUrls = [];
      targetWorkCity = "";
    }

    if (tel === 0 || tel === null) {
      tel = 0;
    }

    if (expectedSalary === null || expectedSalary === "") {
      expectedSalary = 0;
    }

    if (monthsOfCommercialExp < 0) {
      throw new HttpException(
        "Not allowed to set negative values",
        HttpStatus.BAD_REQUEST
      );
    }

    if (!email.includes("@") || email.length <= 5) {
      throw new HttpException(
        `Email should contain @. Got (${email}), and have at least 5 characters.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (firstname === '' && lastname === '' && projectUrls.length === 0) {
      throw new HttpException(
        `${firstname} / ${lastname} / ${projectUrls} cannot be empty`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //UPDATE USER
    await this.userModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          firstName: firstname,
          lastName: lastname,
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
          avatarUrl,
        },
      },
    );

    return {
      text: `User with id (${id}) updated`,
      success: true
    };
  }

  //AVATAR URL SCHEMA CREATE!
  async getSingleUserCV(id: string, res: Response) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      res.json({
        user: user === null ? "User not found" : user
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

  //filter data ERROR WITH OD DO SALARY
  async filterUsers(query: UserFilterInterface) {
    const all = await this.userModel.find().exec();

    return all.filter((user) => {
      let isValid = true;
      for (const key in query) {
        isValid = isValid && user[key] == query[key];
      }
      return isValid;
    });
  }

  async deleteAccount(id: string, res: Response) {
    try {
      const user = await this.userModel.deleteOne({ _id: id });

      if (user.deletedCount <= 0) {
        return res.status(404).json({
          message: "User with that ID was deleted"
        });
      }

      res.status(204).json({
        message: `User with id ${id} has been deleted`,
        success: true
      });
    } catch (e) {
      if (e) {
        res.status(400);
        res.json({
          message: "Invalid id",
          status: false
        });
      }
    }
  }
}

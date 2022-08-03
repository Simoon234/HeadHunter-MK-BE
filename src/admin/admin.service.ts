import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Response } from "express";
import { EmailService } from "../email/email.service";
import { sign, verify } from "jsonwebtoken";
import { HrDto } from "../hr/dto/hr.dto";
import { hashPassword } from "../utils/hashPassword";
import { ChangePasswordInterface, FileInfoInterface, Payload } from "../types";
import { HumanResources } from "../schemas/hr.schema";
import { User, UserDocument } from "../schemas/user.schema";
import { Admin, AdminDocument } from "../schemas/admin.schema";
import { ChangePassword } from "./dto/changePassword.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(EmailService) private emailService: EmailService,
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>
  ) {
  }

  private static filterMethod(obj) {
    const {
      email,
      courseCompletion,
      courseEngagment,
      projectDegree,
      teamProjectDegree,
      bonusProjectUrls
    } = obj;
    return {
      email,
      courseCompletion,
      courseEngagment,
      projectDegree,
      teamProjectDegree,
      bonusProjectUrls
    };
  }

  async createTokenAndSendEmail(payload: Payload, secret: string) {
    const token = sign({ email: payload.email, id: payload.id }, secret, {
      expiresIn: "24h"
    });

    const checkTokenValid = verify(token, secret);
    if (checkTokenValid) {
      await this.emailService.sendEmail(
        payload.email,
        "Register",
        `Click link to register. + ${payload.id} + ${token}`
      );
    } else {
      throw new Error("Token is not valid anymore");
    }

    return {
      payload,
      secret,
      token
    };
  }

  async upload(file: FileInfoInterface, res: Response) {
    const convertFile = file.buffer.toString();
    const parsedObject = JSON.parse(convertFile);

    try {
      if (file.mimetype !== "application/json") {
        return res.json({
          message: "Sorry, we only accept JSON files."
        });
      }

      parsedObject.map(async (obj) => {
        if (!obj.email.includes("@")) {
          return res.json({
            message: `Sorry, we only accept valid email addresses.(missing '@')`
          });
        }
        const getAllUsers = await this.userModel
          .find({ email: obj.email })
          .exec();

        if (!getAllUsers) {
          return res.json({
            message: "Dude the same emails added"
          });
        }

        getAllUsers.map(async (user) => {
          const { token } = await this.createTokenAndSendEmail(
            { email: user.email, id: user.id.toString() },
            process.env.REGISTER_TOKEN_USER
          );
          user.registerToken = token;
          await user.save();
        });

        return res.json({
          users: getAllUsers.map((item) => AdminService.filterMethod(item)),
          status: "Success"
        });
      });
    } catch ({ code, message, result }) {
      if (code === 11000) {
        res.json({
          duplicates: true,
          insertedNewElement: result.nInserted
        });

        console.error(message);
      }
    }
  }

  async changePassword(
    email: string,
    obj: ChangePassword
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
      message: "Successfully updated"
    };
  }

  //

  //HR form
  async addHumanResource(obj: HrDto, res: Response) {
    try {
      const newHr = new this.humanResources({
        name: obj.firstName,
        lastName: obj.lastname,
        email: obj.email,
        company: obj.company
      });
      const data = await newHr.save();

      const { token } = await this.createTokenAndSendEmail(
        { email: newHr.email, id: newHr._id.toString() },
        process.env.REGISTER_TOKEN_USER
      );

      newHr.registerToken = token;
      await newHr.save();

      return res.json({
        id: data._id,
        email: data.email
      });
    } catch (e) {
      if (e.code === 11000) {
        res.json({
          message: "Email exist. Please try again.",
          success: false
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

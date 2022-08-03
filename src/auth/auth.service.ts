import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schemas/user.schema";
import { Model } from "mongoose";
import { LogDto } from "./dto/log.dto";
import { v4 as uuid } from "uuid";
import { Response } from "express";
import { sign } from "jsonwebtoken";
import { RegisterDto } from "./dto/register.dto";
import { hashPassword, verifyPassword } from "../utils/hashPassword";
import { HumanResources } from "src/schemas/hr.schema";
import { EmailService } from "../email/email.service";
import { Role } from "../types";
import { Admin } from "../schemas/admin.schema";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(HumanResources.name) private hr: Model<HumanResources>,
    @Inject(EmailService) private mailService: EmailService,
    @InjectModel(Admin.name) private admin: Model<Admin>
  ) {
  }

  private static createToken(
    currentTokenId: string,
    email: string
  ): {
    accessToken: string;
    expiresIn: number;
  } {
    const payload: { id: string; email: string } = {
      id: currentTokenId,
      email
    };
    const expiresIn = 60 * 60 * 24;
    const accessToken = sign(payload, process.env.LOG_TOKEN, {
      expiresIn
    });

    return {
      accessToken,
      expiresIn
    };
  }

  async login(req: LogDto, res: Response) {
    const { email, password } = req;

    const users = await this.user.find({ email }).exec();
    const hr = await this.hr.find({ email }).exec();
    const admins = await this.admin.find({ email }).exec();

    const all = [...users, ...hr, ...admins];

    if (all.length === 0) {
      throw new HttpException(
        "User not found. Please try again.",
        HttpStatus.NOT_FOUND
      );
    }

    try {
      all.map(async (item) => {
        if (item.accessToken) {
          return res.json({
            message: "You are already logged in."
          });
        }
        const pwd = await verifyPassword(password, item.password);

        if (pwd === false) {
          return res.json({ error: "Invalid login" });
        }

        const token = AuthService.createToken(
          await this.generateToken(item),
          item.email
        );

        return res
          .cookie("jwt", token.accessToken, {
            secure: false,
            domain: "localhost",
            httpOnly: true
          })
          .json({
            id: item._id,
            email: item.email,
            firstName:
              item.role !== Role.HR
                ? item.role !== Role.ADMIN
                  ? item?.firstName
                  : ""
                : "",
            lastName: item.role === Role.ADMIN ? "" : item?.lastName,
            role: item.role
          });
      });
    } catch (e) {
      console.log(e);
      return res.json({ error: e.message });
    }
  }
  async registerHr(
    id: string,
    registerToken: string,
    obj: RegisterDto,
    res: Response
  ) {
    try {
      if (obj.password !== obj.passwordRepeat) {
        res.json({
          message: "Passwords are not the same"
        });
      }

      const hashPwd = await hashPassword(obj.password);

      await this.hr.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } }
      );

      const get = await this.hr.findById({ _id: id });
      if (get.registerToken === null && get.active === true) {
        res.json({
          message: "You are already registered"
        });
      }

      return res.json({
        registeredId: get._id,
        success: true
      });
    } catch (err) {
      res.json({
        message: err.message
      });
      console.error(err);
    }
  }

  async registerUser(
    id: string,
    registerToken: string,
    obj: RegisterDto,
    res: Response
  ) {
    try {
      if (obj.password !== obj.passwordRepeat) {
        res.json({
          message: "Passwords are not the same"
        });
      }

      const hashPwd = await hashPassword(obj.password);

      await this.user.updateOne(
        { _id: id },
        { $set: { password: hashPwd, active: true, registerToken: null } }
      );

      const get = await this.user.findById({ _id: id });

      if (get.registerToken === null && get.active === true) {
        res.json({
          message: "You are already registered"
        });
      } else {
        res.json({
          registeredId: get._id,
          success: true
        });
      }
    } catch (err) {
      res.json({
        message: err.message
      });
      console.error(err);
    }
  }

  async logout(person, res: Response) {
    console.log({ person });
    try {
      person.accessToken = null;
      await person.save();
      return res
        .clearCookie("jwt", {
          secure: false,
          domain: "localhost",
          httpOnly: true
        })
        .json({
          message: "Logged out."
        });
    } catch (err) {
      res.json({
        error: err.message
      });
    }
  }

  async remindPassword(email: string) {
    const user = await this.user.findOne({ email });

    if (!user) {
      throw new HttpException("No user found", HttpStatus.NOT_FOUND);
    }

    if (!user.email) {
      throw new HttpException(
        `No user with that: (${email}) email`,
        HttpStatus.BAD_REQUEST
      );
    }

    user.refreshToken = sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_REMINDER,
      {
        expiresIn: "1h"
      }
    );
    await user.save();

    await this.mailService.sendEmail(
      user.email,
      "Password reset",
      `<p>Click <a href="ERROR">here</a> to reset your password</p>`
    );

    return {
      message: "Check your email address."
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

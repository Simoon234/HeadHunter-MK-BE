import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { hashPassword } from "../utils/hashPassword";
import { HrRegisterDto } from "./dto/hr.register.dto";
import { HumanResources } from "../schemas/hr.schema";
import { sign, TokenExpiredError, verify } from "jsonwebtoken";
import { User } from "../schemas/user.schema";
import { Status } from "../types";

@Injectable()
export class HrService {
  constructor(
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>,
    @InjectModel(User.name) private user: Model<User>
  ) {
  }

  async register(id: string, obj: HrRegisterDto, res: any) {
    try {
      if (obj.password !== obj.passwordRepeat) {
        return new HttpException(
          'Password are not the same.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashPwd = await hashPassword(obj.password);

      await this.humanResources.updateOne(
        { _id: id },
        { $set: { password: hashPwd } },
      );

      return res.json({
        message: "Successfully registered.",
        success: true
      });
    } catch (err) {
      res.json({
        message: err.message
      });
      console.error(err);
    }
  }

  async addToTalk(id: string) {
    const addUserToTalk = await this.user.findOne({ _id: id });

    if (!(addUserToTalk.status === Status.ACTIVE)) {
      throw new HttpException(
        "Sorry, you are not allowed to add this user because he/she is not active",
        HttpStatus.BAD_REQUEST
      );
    }
    const token = sign(
      { email: addUserToTalk.email },
      process.env.TOKEN_ADDED_USER_HR,
      {
        expiresIn: "30s"
      }
    );

    await this.user.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          addedByHr: token
        }
      }
    );

    const hr = await this.humanResources.findById({
      _id: "62db2ff5e6626c2bf8042bd1"
    });

    hr.users.map((item) => {
      if (item.toString() === addUserToTalk._id.toString()) {
        throw new Error("You tried to add user which is already added.");
      }
    });

    hr.users.push(addUserToTalk);
    await hr.save();
    return {
      success: true
    };
  }

  // w parametrze przekażemy hr (req.user) i stamtąd wezmiemy id
  async usersAddedToTalkByCurrentHr() {
    const getAdmin = await this.humanResources.findById({
      _id: "62db2ff5e6626c2bf8042bd1"
    });
    const users = getAdmin.users;
    const convertToString = users.map((item) => item.toString());

    const usersAdded = await this.user
      .find()
      .where("_id")
      .in(convertToString)
      .exec();

    usersAdded.map(async (item) => {
      const token = item.addedByHr;

      //tutaj trzeba zastanowić się jak usunąć to id z tej tablicy...

      verify(token, process.env.TOKEN_ADDED_USER_HR, async (err, user) => {
        if (err instanceof TokenExpiredError) {
          item.addedByHr = null;
          item.status = Status.ACTIVE;
          await item.save();
          return user;
        }
      });
    });

    return usersAdded;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HumanResources } from '../schemas/hr.schema';
import { sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { User } from '../schemas/user.schema';
import { Status } from '../types';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HrService {
  constructor(
    @InjectModel(HumanResources.name)
    private humanResources: Model<HumanResources>,
    @InjectModel(User.name) private user: Model<User>,
  ) {}

  async addToTalk(id: string) {
    const addUserToTalk = await this.user.findOne({ _id: id });

    console.log(addUserToTalk);

    if (
      !(addUserToTalk.status === Status.ACTIVE) ||
      addUserToTalk.active === false
    ) {
      throw new HttpException(
        'Sorry, you are not allowed to add this user because he/she is not active',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = sign(
      { email: addUserToTalk.email },
      process.env.TOKEN_ADDED_USER_HR,
      {
        expiresIn: '30s',
      },
    );

    await this.user.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          addedByHr: token,
        },
      },
    );

    const hr = await this.humanResources.findById({
      _id: '62e3f21255a468261b0d9494',
    });

    hr.users.map((item) => {
      if (item.toString() === addUserToTalk._id.toString()) {
        throw new Error('You tried to add user which is already added.');
      }
    });

    hr.users.push(addUserToTalk);
    await hr.save();
    return {
      success: true,
    };
  }

  // w parametrze przekażemy hr (req.user) i stamtąd wezmiemy id
  async usersAddedToTalkByCurrentHr() {
    const getAdmin = await this.humanResources.findById({
      _id: '62e3f21255a468261b0d9494',
    });
    const users = getAdmin.users;

    if (users === null) {
      return {
        message: 'No users were added.',
      };
    }

    const convertToString = users.map((item) => item.toString());

    const usersAdded = await this.user
      .find()
      .where('_id')
      .in(convertToString)
      .exec();

    usersAdded.map(async (item) => {
      const token = item.addedByHr;

      //tutaj trzeba zastanowić się jak usunąć to id z tej tablicy...

      await this.checkToken(token, process.env.TOKEN_ADDED_USER_HR, item);
    });

    return usersAdded;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async checkToken(token, env, item) {
    verify(token, env, async (err, user) => {
      if (err instanceof TokenExpiredError) {
        item.addedByHr = null;
        item.status = Status.ACTIVE;
        await item.save();
        return user;
      }
    });

    return {
      token,
      env,
      item,
    };
  }

  async notInterested(id: string) {
    await this.user.findOneAndUpdate(
      { _id: id },
      { $set: { status: Status.ACTIVE } },
    );
    return {
      message: 'User has been removed from (Do rozmowy) column',
    };
  }
}

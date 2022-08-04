import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HumanResources } from '../schemas/hr.schema';
import { Admin } from 'src/schemas/admin.schema';

function cookieExtract(req: any): null | string {
  return req && req.cookies ? req.cookies?.jwt ?? null : null;
}

@Injectable()
export class JwtStr extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(HumanResources.name) private hr: Model<HumanResources>,
    @InjectModel(Admin.name) private admin: Model<Admin>,
  ) {
    super({
      jwtFromRequest: cookieExtract,
      secretOrKey: process.env.LOG_TOKEN,
    });
  }

  async validate(payload: any, done: (err, user) => void) {
    const candidates = await this.user.find({ _id: payload.userId }).exec();
    const hr = await this.hr.find({ _id: payload.userId }).exec();
    const admins = await this.admin.find({ _id: payload.userId }).exec();

    const all = [...candidates, ...hr, ...admins];

    if (!payload && !payload.id) {
      return done(new UnauthorizedException(), false);
    }

    const user = all.find((item) => item.accessToken === payload.id);

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    done(null, user);
  }
}

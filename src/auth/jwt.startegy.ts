import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

function cookieExtract(req: any): null | string {
  return req && req.cookies ? req.cookies?.jwt ?? null : null;
}

@Injectable()
export class JwtStr extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private user: Model<User>) {
    super({
      jwtFromRequest: cookieExtract,
      secretOrKey: process.env.LOG_TOKEN,
    });
  }

  async validate(payload: any, done: (err, user) => void) {
    if (!payload && !payload.id) {
      return done(new UnauthorizedException(), false);
    }

    const user = await this.user.findOne({
      where: { accessToken: payload.id },
    });

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    done(null, user);
  }
}

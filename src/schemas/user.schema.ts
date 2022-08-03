import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Apprentice, ContractType, Role, Status, WorkType } from '../types';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
  })
  password: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  })
  courseCompletion: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  })
  courseEngagment: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  })
  projectDegree: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  })
  teamProjectDegree: number;

  @Prop({
    type: Array,
    required: true,
    default: [],
  })
  bonusProjectUrls: string[];

  @Prop({
    type: Number,
    default: null,
  })
  tel: number;

  @Prop({
    type: String,
    default: null,
  })
  firstName: string;

  @Prop({
    type: String,
    default: null,
  })
  lastName: string;

  @Prop({
    type: String,
    default: null,
  })
  githubUsername: string;

  @Prop({
    type: Array,
    default: [],
  })
  portfolioUrls: string[];

  @Prop({
    default: [],
    type: Array,
  })
  projectUrls: string[];

  @Prop({
    type: String,
  })
  bio: string;

  @Prop({
    type: String,
    enum: WorkType,
    default: WorkType.WHATEVER,
  })
  expectedTypeWork: WorkType;

  @Prop({
    type: String,
    default: null,
  })
  targetWorkCity: string;

  @Prop({
    type: String,
    enum: ContractType,
    default: ContractType.WHATEVER,
  })
  expectedContractType: ContractType;

  @Prop({
    type: Number,
    default: 0,
  })
  expectedSalary: number;

  @Prop({
    type: Boolean,
    enum: Apprentice,
    default: Apprentice.NO,
  })
  canTakeApprenticeship: Apprentice;

  @Prop({
    type: Number,
    default: null,
  })
  monthsOfCommercialExp: number;

  @Prop({
    type: String,
  })
  education: string;

  @Prop({
    type: String,
  })
  workExperience: string;

  @Prop({
    type: String,
  })
  courses: string;

  @Prop({
    type: Boolean,
    default: 0,
  })
  active: boolean;

  @Prop({
    type: String,
    default: Status.ACTIVE,
    enum: Status,
  })
  status: Status;

  @Prop({
    type: String,
    default:
      'https://www.deviantart.com/karmaanddestiny/art/Default-user-icon-4-858661084',
  })
  avatarUrl: string;

  @Prop({
    type: String,
    default: null,
  })
  registerToken: string;

  @Prop({
    type: String,
    default: null,
    nullable: true,
  })
  accessToken: string;

  @Prop({
    type: String,
    default: null,
    nullable: true,
  })
  refreshToken: string;

  @Prop({
    type: String,
    default: Role.STUDENT,
    enum: Role,
  })
  role: Role.STUDENT;

  @Prop({
    default: null,
    type: String,
  })
  addedByHr: string;
}

//api for user if exist.
// https://api.github.com/users/{username}

export const UserSchema = SchemaFactory.createForClass(User);

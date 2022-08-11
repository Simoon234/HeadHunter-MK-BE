import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Apprentice, ContractType, Role, Status, WorkType } from '../types';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    type: String,
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
  courseEngagement: number;

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
  projectUrls: string[];

  @Prop({
    type: String,
    default: '',
  })
  tel: number;

  @Prop({
    type: String,
    default: '',
  })
  firstName: string;

  @Prop({
    type: String,
    default: '',
  })
  lastName: string;

  @Prop({
    type: String,
    default: '',
  })
  githubUsername: string;

  @Prop({
    type: Array,
    default: [],
  })
  portfolioUrls: string[];

  @Prop({
    type: String,
    default: '',
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
    default: '',
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
    type: Number,
    enum: Apprentice,
    default: Apprentice.NO,
  })
  canTakeApprenticeship: Apprentice;

  @Prop({
    type: Number,
    default: 0,
  })
  monthsOfCommercialExp: number;

  @Prop({
    default: '',
    type: String,
  })
  education: string;

  @Prop({
    default: '',
    type: String,
  })
  workExperience: string;

  @Prop({
    default: '',
    type: String,
  })
  courses: string;

  @Prop({
    type: Boolean,
    default: false,
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

  @Prop({
    default: [],
    type: Array,
  })
  scrumUrls: string[];

  @Prop({
    default: true,
    type: Boolean,
  })
  firstLogin: boolean;


  @Prop({
    default: [],
    type: Array,
  })
  bonusProjectUrls: string[];
}

//api for user if exist.
// https://api.github.com/users/{username}

export const UserSchema = SchemaFactory.createForClass(User);

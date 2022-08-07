import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { ContractType, WorkType } from '../../types';

export class UserUpdateDto {
  @IsString()
  email: string;

  @IsNumber()
  tel: number;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  githubUsername: string;

  @IsArray()
  portfolioUrls: string[];

  @IsArray()
  projectUrls: string[];

  @IsArray()
  scrumUrls: string[];

  @IsString()
  bio: string;

  @IsEnum(WorkType)
  expectedTypeWork: WorkType;

  @IsString()
  targetWorkCity: string;

  @IsEnum(ContractType)
  expectedContractType: ContractType;

  @IsString()
  expectedSalary: string | number;

  @IsBoolean()
  canTakeApprenticeship: boolean;

  @IsNumber()
  monthsOfCommercialExp: number;

  @IsString()
  education: string;

  @IsString()
  workExperience: string;

  @IsString()
  courses: string;

  @IsString()
  avatarUrl: string;
}

import { IsArray, IsNumber, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsString()
  email: string;

  @IsString()
  tel: string;

  @IsString()
  firstName: string;

  @IsString()
  password: string;

  @IsString()
  passwordRepeat: string;

  @IsString()
  lastName: string;

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

  @IsString()
  expectedTypeWork: string;

  @IsString()
  targetWorkCity: string;

  @IsString()
  expectedContractType: string;

  @IsNumber()
  expectedSalary: number;

  @IsNumber()
  canTakeApprenticeship: number;

  @IsNumber()
  monthsOfCommercialExp: number;

  @IsString()
  education: string;

  @IsString()
  workExperience: string;

  @IsString()
  courses: string;
}

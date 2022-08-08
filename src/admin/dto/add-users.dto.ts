import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddStudentInterface } from '../../types';

export class AddUsersDto implements AddStudentInterface {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  projectUrls: string[];

  @IsNumber()
  courseCompletion: number;

  @IsNumber()
  courseEngagement: number;

  @IsNumber()
  projectDegree: number;

  @IsNumber()
  teamProjectDegree: number;
}

import { IsEmail, IsNumber, IsString } from "class-validator";
import { AddStudentInterface } from "../../types";

export class AddUsersDto implements AddStudentInterface {
  @IsString()
  bonusProjectUrls: string[];
  @IsNumber()
  courseCompletion: number;
  @IsNumber()
  courseEngagement: number;
  @IsEmail()
  email: string;
  @IsNumber()
  projectDegree: number;
  @IsNumber()
  teamProjectDegree: number;
}

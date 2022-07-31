import { IsString } from "class-validator";

export class LogDto {
  @IsString()
  email: string;
  @IsString()
  password: string;
}
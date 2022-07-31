import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { HrInterfaces } from "../../types";

export class HrDto implements HrInterfaces {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  company: string;
}

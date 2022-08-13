import { HrInterfaces } from '../../types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class HrUpdateDto implements HrInterfaces {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  password: string;

  @IsString()
  passwordRepeat: string;
}

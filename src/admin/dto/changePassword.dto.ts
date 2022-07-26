import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePassword {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordRepeat: string;
}

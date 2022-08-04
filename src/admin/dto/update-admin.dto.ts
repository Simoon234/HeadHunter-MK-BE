import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAdmin {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;

  @IsString()
  passwordRepeat: string;
}

import { IsDefined, IsString } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsDefined()
  password: string;

  @IsString()
  @IsDefined()
  passwordRepeat: string;
}

import {IsDefined, IsString} from "class-validator";

export class HrRegisterDto {
    @IsString()
    @IsDefined()
    password: string;

    @IsString()
    @IsDefined()
    passwordRepeat: string;

}
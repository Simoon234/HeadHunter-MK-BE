import {IsArray, IsBoolean, IsEnum, IsInt, IsString} from "class-validator";
import {ContractType, WorkType} from "../../types";

export class UserUpdateDto {
    @IsString()
    email: string;

    @IsInt()
    tel: number;

    @IsString()
    firstname: string;

    @IsString()
    lastname: string;

    @IsString()
    githubUsername: string;

    @IsArray()
    portfolioUrls: string[];

    @IsArray()
    projectUrls: string[];

    @IsString()
    bio: string;

    @IsEnum(WorkType)
    expectedTypeWork: WorkType;

    @IsString()
    targetWorkCity: string;

    @IsEnum(ContractType)
    expectedContractType: ContractType;

    @IsString()
    expectedSalary: string | number;

    @IsBoolean()
    canTakeApprenticeship: boolean;

    @IsInt()
    monthsOfCommercialExp: number;

    @IsString()
    education: string;

    @IsString()
    workExperience: string;

    @IsString()
    courses: string;

    avatarUrl: string;
}
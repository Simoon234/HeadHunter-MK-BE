import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { HrInterfaces } from '../../types';

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

  @IsInt()
  @Min(1)
  @Max(999)
  maxReservedStudents: number;
}

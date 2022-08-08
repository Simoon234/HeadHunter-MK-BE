import { User } from '../schemas/user.schema';

export enum WorkType {
  STAY = 'Na miejscu',
  MOVE = 'Gotowość do przeprowadzki',
  REMOTE = 'Wyłącznie zdalnie',
  HYBRID = 'Hybrydowo',
  WHATEVER = 'Bez znaczenia',
}

export enum ContractType {
  UOP = 'UOP',
  B2B = 'B2B',
  UZ = 'UZ',
  UOD = 'UoD',
  WHATEVER = 'Brak preferencji',
}

export enum Apprentice {
  YES,
  NO,
}

export enum Status {
  ACTIVE = 'Do rozmowy',
  CALL = 'W trakcie rozmowy',
  HIRED = 'Zatrudniony',
}

// Interfaces

export interface HrInterfaces {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export interface ReturnedUsersValuesInterfaces {
  users: User[];
  pages: number;
}

// export interface SuccessfullyUpdatedUsersInterfaces {
//   success: boolean;
//   text: string;
// }

export interface UserFilterInterface {
  courseCompletion: number;
  courseEngagment: number;
  projectDegree: number;
  teamProjectDegree: number;
  expectedTypeWork: WorkType;
  expectedContractType: ContractType;
  expectedSalary: number;
  canTakeApprenticeship: boolean;
  monthsOfCommercialExp: number;
}

export interface FileInfoInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: any;
  size: number;
}

export interface Payload {
  email: string;
  id: string;
}

export enum Role {
  ADMIN = 'admin',
  STUDENT = 'student',
  HR = 'hr',
}

export interface AddStudentInterface {
  id: string;
  email: string;
  courseCompletion: number;
  courseEngagement: number;
  projectDegree: number;
  teamProjectDegree: number;
  projectUrls: string[];
}

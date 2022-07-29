import { User } from "../schemas/user.schema";

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
  UoD = 'UoD',
  WHATEVER = 'Brak preferencji',
}

export enum Apprentice {
  YES = "true",
  NO = "false",
}

export enum Status {
  ACTIVE = 'Do rozmowy',
  CALL = 'W trakcie rozmowy',
  HIRED = 'Zatrudniony',
}

// Interfaces

export interface HrInterfaces {
  name: string;
  lastname: string;
  email: string;
  company: string;
  maxReservedStudents: number;
}

export interface ReturnedUsersValuesInterfaces {
  users: User[];
  pages: number;
}

export interface SuccessfullyUpdatedUsersInterfaces {
  success: boolean;
  text: string;
}

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

export interface ChangePasswordInterface {
  message: string;
  email: string;
}

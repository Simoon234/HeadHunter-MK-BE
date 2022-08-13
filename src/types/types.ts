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

export enum Grade {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
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
  email: string;
  courseCompletion: number;
  courseEngagement: number;
  projectDegree: number;
  teamProjectDegree: number;
  bonusProjectUrls: string[];
}


export interface Person {
  id: string;
  accessToken: string;
  role: Role;
}

export interface PasswordResetRes {
  success: boolean;
  message: string;
}

export interface TokenGenerator {
  accessToken: string;
  expiresIn: number;
}

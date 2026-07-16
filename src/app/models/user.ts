export type Gender = 'male' | 'female';
export type RacerLevel = 'rookie' | 'junior' | 'pro';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  level: RacerLevel;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface LoginPayload {
  username: string;
  password: string;
}

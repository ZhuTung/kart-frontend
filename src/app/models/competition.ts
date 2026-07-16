export type CompetitionLevel = 'rookie' | 'junior' | 'pro';

export interface CompetitionLocation {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface CompetitionCreator {
  id: string;
  username: string;
  displayName: string;
}

export interface CompetitionParticipant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  level: CompetitionLevel;
  displayName: string;
  joinedAt: string;
}

export interface Competition {
  id: number;
  title: string;
  locationId: number;
  location: CompetitionLocation;
  raceDate: string;
  raceTime: string;
  level: CompetitionLevel;
  createdBy: string;
  creator: CompetitionCreator;
  joinCount: number;
  joinedByMe: boolean;
  participants: CompetitionParticipant[];
  createdAt: string;
}

export interface CompetitionPayload {
  title: string;
  locationId: number;
  raceDate: string;
  raceTime: string;
  level: CompetitionLevel;
}

export interface CompetitionResponse {
  message: string;
  competition: Competition;
}

export interface JoinResponse {
  message: string;
  participants: CompetitionParticipant[];
  joinCount: number;
}

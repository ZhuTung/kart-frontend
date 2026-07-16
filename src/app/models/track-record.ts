export interface TrackRecordLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  trackLengthKm: number | null;
}

export interface TrackRecord {
  id: number;
  locationId: number | null;
  location: TrackRecordLocation | null;
  raceDate: string;
  laps: number;
  averageLapTime: number;
  bestLapTime: number;
  totalTime: number;
  mileage: number;
  averageLapTimeFormatted: string;
  bestLapTimeFormatted: string;
  totalTimeFormatted: string;
  createdAt: string;
}

export interface TrackRecordPayload {
  locationId: number;
  raceDate: string;
  laps: number;
  averageLapTime: string;
  bestLapTime: string;
  totalTime: string;
  mileage: number;
}

export interface TrackRecordResponse {
  message: string;
  record: TrackRecord;
}

import { User } from './user';
import { TrackRecord } from './track-record';

export interface PublicUser extends User {
  displayName: string;
}

export interface UserProfile {
  user: PublicUser;
  trackRecords: TrackRecord[];
}

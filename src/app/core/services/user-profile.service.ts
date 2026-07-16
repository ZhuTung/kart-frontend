import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile';

const API_URL = 'http://localhost:3000/api/users';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_URL}/${userId}`);
  }
}

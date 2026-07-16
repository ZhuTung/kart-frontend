import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiBaseUrl}/api/users`;

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_URL}/${userId}`);
  }
}

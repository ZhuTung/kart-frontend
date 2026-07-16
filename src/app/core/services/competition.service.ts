import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Competition,
  CompetitionPayload,
  CompetitionResponse,
  JoinResponse,
} from '../../models/competition';

const API_URL = 'http://localhost:3000/api/competitions';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Competition[]> {
    return this.http.get<Competition[]>(API_URL);
  }

  getById(id: number): Observable<Competition> {
    return this.http.get<Competition>(`${API_URL}/${id}`);
  }

  create(payload: CompetitionPayload): Observable<CompetitionResponse> {
    return this.http.post<CompetitionResponse>(API_URL, payload);
  }

  join(id: number): Observable<JoinResponse> {
    return this.http.post<JoinResponse>(`${API_URL}/${id}/join`, {});
  }

  leave(id: number): Observable<JoinResponse> {
    return this.http.delete<JoinResponse>(`${API_URL}/${id}/join`);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/${id}`);
  }
}

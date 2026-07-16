import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrackRecord, TrackRecordPayload, TrackRecordResponse } from '../../models/track-record';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiBaseUrl}/api/track-records`;

@Injectable({ providedIn: 'root' })
export class TrackRecordService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<TrackRecord[]> {
    return this.http.get<TrackRecord[]>(API_URL);
  }

  create(payload: TrackRecordPayload): Observable<TrackRecordResponse> {
    return this.http.post<TrackRecordResponse>(API_URL, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/${id}`);
  }
}

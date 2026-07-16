import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KartLocation } from '../../models/kart-location';

const API_URL = 'http://localhost:3000/api/locations';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<KartLocation[]> {
    return this.http.get<KartLocation[]>(API_URL);
  }

  getById(id: number): Observable<KartLocation> {
    return this.http.get<KartLocation>(`${API_URL}/${id}`);
  }
}

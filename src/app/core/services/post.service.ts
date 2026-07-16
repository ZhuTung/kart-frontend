import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LikeResponse, Post, PostResponse } from '../../models/post';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiBaseUrl}/api/posts`;
export const MEDIA_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(API_URL);
  }

  create(title: string, description: string, media: File): Observable<PostResponse> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('media', media);
    return this.http.post<PostResponse>(API_URL, formData);
  }

  toggleLike(id: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${API_URL}/${id}/like`, {});
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/${id}`);
  }

  mediaUrl(path: string): string {
    return `${MEDIA_BASE_URL}${path}`;
  }
}

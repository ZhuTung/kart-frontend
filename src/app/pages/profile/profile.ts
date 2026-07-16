import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { PublicUser } from '../../models/user-profile';
import { TrackRecord } from '../../models/track-record';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(UserProfileService);

  readonly user = signal<PublicUser | null>(null);
  readonly trackRecords = signal<TrackRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.error.set('Invalid profile');
      this.loading.set(false);
      return;
    }

    this.profileService.getProfile(userId).subscribe({
      next: (data) => {
        this.user.set(data.user);
        this.trackRecords.set(data.trackRecords);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      },
    });
  }

  isOwnProfile(): boolean {
    const u = this.user();
    return u !== null && u.id === this.auth.currentUser()?.id;
  }

  logout(): void {
    this.auth.logout();
  }
}

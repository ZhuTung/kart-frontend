import { Component, computed, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly displayName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Racer';
  });

  logout(): void {
    this.auth.logout();
  }
}

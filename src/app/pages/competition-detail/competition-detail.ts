import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CompetitionService } from '../../core/services/competition.service';
import { Competition } from '../../models/competition';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { CompetitionJoinDialog } from '../../shared/components/competition-join-dialog/competition-join-dialog';

@Component({
  selector: 'app-competition-detail',
  imports: [DatePipe, RouterLink, ConfirmDialog, CompetitionJoinDialog],
  templateUrl: './competition-detail.html',
  styleUrl: './competition-detail.css',
})
export class CompetitionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly competitionService = inject(CompetitionService);

  readonly currentUser = this.auth.currentUser;
  readonly competition = signal<Competition | null>(null);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly error = signal('');
  readonly deleteDialogOpen = signal(false);
  readonly joinDialogOpen = signal(false);
  readonly deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Invalid competition');
      this.loading.set(false);
      return;
    }

    this.competitionService.getById(id).subscribe({
      next: (data) => {
        this.competition.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load competition');
        this.loading.set(false);
      },
    });
  }

  isCreator(): boolean {
    const comp = this.competition();
    return comp !== null && comp.createdBy === this.currentUser()?.id;
  }

  requestJoin(): void {
    this.joinDialogOpen.set(true);
  }

  cancelJoin(): void {
    if (!this.actionLoading()) {
      this.joinDialogOpen.set(false);
    }
  }

  confirmJoin(): void {
    this.join();
  }

  join(): void {
    const comp = this.competition();
    if (!comp) return;

    this.actionLoading.set(true);
    this.error.set('');
    this.competitionService.join(comp.id).subscribe({
      next: (res) => {
        this.competition.update((c) =>
          c ? { ...c, participants: res.participants, joinCount: res.joinCount, joinedByMe: true } : c
        );
        this.actionLoading.set(false);
        this.joinDialogOpen.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.error.set(err.error?.message || 'Failed to join');
      },
    });
  }

  leave(): void {
    const comp = this.competition();
    if (!comp) return;

    this.actionLoading.set(true);
    this.error.set('');
    this.competitionService.leave(comp.id).subscribe({
      next: (res) => {
        this.competition.update((c) =>
          c ? { ...c, participants: res.participants, joinCount: res.joinCount, joinedByMe: false } : c
        );
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.error.set(err.error?.message || 'Failed to leave');
      },
    });
  }

  requestDelete(): void {
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
  }

  confirmDelete(): void {
    const comp = this.competition();
    if (!comp) return;

    this.deleting.set(true);
    this.competitionService.delete(comp.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.router.navigate(['/competitions']);
      },
      error: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.error.set('Failed to delete competition');
      },
    });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  logout(): void {
    this.auth.logout();
  }
}

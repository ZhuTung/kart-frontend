import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-competition-join-dialog',
  templateUrl: './competition-join-dialog.html',
  styleUrl: './competition-join-dialog.css',
})
export class CompetitionJoinDialog {
  readonly open = input(false);
  readonly competitionTitle = input('');
  readonly competitionLevel = input('');
  readonly venueName = input('');
  readonly confirming = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly rules = [
    'You must arrive at the venue at least 30 minutes before the scheduled race time.',
    'Full safety gear is mandatory — helmet, race suit, and closed-toe shoes at all times on track.',
    'Your racer level must meet or be appropriate for this competition tier.',
    'Follow all instructions from race officials and venue staff without exception.',
    'Dangerous driving, blocking, or intentional contact may result in disqualification.',
    'The event host\'s decisions on disputes, penalties, and grid changes are final.',
    'You are responsible for your own physical fitness to compete safely.',
    'By joining, you agree that KartSys acts only as a platform and is not liable for on-track incidents.',
  ];

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.confirming()) {
      this.cancelled.emit();
    }
  }

  onBackdropClick(): void {
    if (!this.confirming()) {
      this.cancelled.emit();
    }
  }

  onCancel(): void {
    if (!this.confirming()) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    if (!this.confirming()) {
      this.confirmed.emit();
    }
  }
}

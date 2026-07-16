import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirming = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

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

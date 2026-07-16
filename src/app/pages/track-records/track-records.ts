import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { TrackRecordService } from '../../core/services/track-record.service';
import { KartLocation } from '../../models/kart-location';
import { TrackRecord } from '../../models/track-record';
import { formatSecondsToTime, parseTimeToSeconds } from '../../core/utils/time';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { DatePicker } from '../../shared/components/date-picker/date-picker';
import { TrackRecordCharts } from '../../shared/components/track-record-charts/track-record-charts';

@Component({
  selector: 'app-track-records',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ConfirmDialog, DatePicker, TrackRecordCharts],
  templateUrl: './track-records.html',
  styleUrl: './track-records.css',
})
export class TrackRecords implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly trackService = inject(TrackRecordService);
  private readonly locationService = inject(LocationService);
  private readonly route = inject(ActivatedRoute);

  readonly records = signal<TrackRecord[]>([]);
  readonly locations = signal<KartLocation[]>([]);
  readonly loading = signal(false);
  readonly locationsLoading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly fieldErrors = signal<string[]>([]);
  readonly success = signal('');
  readonly deleteDialogOpen = signal(false);
  readonly deleteTargetId = signal<number | null>(null);
  readonly deleting = signal(false);
  readonly maxDate = new Date().toISOString().split('T')[0];

  readonly form = this.fb.nonNullable.group({
    locationId: [0, [Validators.required, Validators.min(1)]],
    raceDate: [this.todayIso(), Validators.required],
    laps: [10, [Validators.required, Validators.min(1)]],
    averageLapTime: ['', Validators.required],
    bestLapTime: ['', Validators.required],
    totalTime: ['', Validators.required],
    trackLengthKm: [0],
    mileage: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.loadLocations();
    this.loadRecords();

    this.form.controls.laps.valueChanges.subscribe(() => this.recalculateDerived());
    this.form.controls.averageLapTime.valueChanges.subscribe(() => this.recalculateDerived());
    this.form.controls.locationId.valueChanges.subscribe((id) =>
      this.onLocationChange(Number(id))
    );
  }

  loadLocations(): void {
    this.locationsLoading.set(true);
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.locations.set(data);
        this.locationsLoading.set(false);

        const paramId = Number(this.route.snapshot.queryParamMap.get('locationId'));
        if (paramId && data.some((l) => l.id === paramId)) {
          this.form.controls.locationId.setValue(paramId);
        }
      },
      error: () => {
        this.error.set('Failed to load kart locations');
        this.locationsLoading.set(false);
      },
    });
  }

  loadRecords(): void {
    this.loading.set(true);
    this.trackService.getAll().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load track records');
        this.loading.set(false);
      },
    });
  }

  selectedLocation(): KartLocation | undefined {
    const id = Number(this.form.controls.locationId.value);
    return this.locations().find((l) => l.id === id);
  }

  onLocationChange(locationId: number): void {
    const id = Number(locationId);
    const location = this.locations().find((l) => l.id === id);
    const trackLength = location?.trackLengthKm ?? 0;
    this.form.controls.trackLengthKm.setValue(trackLength, { emitEvent: false });
    this.recalculateMileage();
  }

  recalculateDerived(): void {
    const laps = this.form.controls.laps.value;
    const avgStr = this.form.controls.averageLapTime.value;
    const avgSeconds = parseTimeToSeconds(avgStr);

    if (avgSeconds !== null && laps > 0) {
      const total = avgSeconds * laps;
      this.form.controls.totalTime.setValue(formatSecondsToTime(total), { emitEvent: false });
    }

    this.recalculateMileage();
  }

  recalculateMileage(): void {
    const laps = this.form.controls.laps.value;
    const trackLength = this.form.controls.trackLengthKm.value;

    if (laps > 0 && trackLength > 0) {
      const mileage = +(laps * trackLength).toFixed(3);
      this.form.controls.mileage.setValue(mileage, { emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.fieldErrors.set([]);
    this.success.set('');

    this.trackService
      .create({
        locationId: Number(raw.locationId),
        raceDate: raw.raceDate,
        laps: raw.laps,
        averageLapTime: raw.averageLapTime,
        bestLapTime: raw.bestLapTime,
        totalTime: raw.totalTime,
        mileage: raw.mileage,
      })
      .subscribe({
        next: (res) => {
          this.records.update((list) => [res.record, ...list]);
          this.saving.set(false);
          this.success.set('Track record saved!');
          this.form.patchValue({
            averageLapTime: '',
            bestLapTime: '',
            totalTime: '',
            mileage: 0,
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Failed to save track record');
          if (err.error?.errors) {
            this.fieldErrors.set(err.error.errors);
          }
        },
      });
  }

  requestDelete(id: number): void {
    this.deleteTargetId.set(id);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deleteTargetId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.deleting.set(true);
    this.trackService.delete(id).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.id !== id));
        this.deleting.set(false);
        this.cancelDelete();
      },
      error: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.error.set('Failed to delete track record');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }

  private todayIso(): string {
    return new Date().toISOString().split('T')[0];
  }
}

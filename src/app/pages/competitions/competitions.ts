import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CompetitionService } from '../../core/services/competition.service';
import { LocationService } from '../../core/services/location.service';
import { Competition, CompetitionLevel } from '../../models/competition';
import { KartLocation } from '../../models/kart-location';
import { DatePicker } from '../../shared/components/date-picker/date-picker';

@Component({
  selector: 'app-competitions',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, DatePicker],
  templateUrl: './competitions.html',
  styleUrl: './competitions.css',
})
export class Competitions implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly competitionService = inject(CompetitionService);
  private readonly locationService = inject(LocationService);

  readonly competitions = signal<Competition[]>([]);
  readonly locations = signal<KartLocation[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly fieldErrors = signal<string[]>([]);
  readonly success = signal('');
  readonly levelFilter = signal<'all' | CompetitionLevel>('all');
  readonly minDate = new Date().toISOString().split('T')[0];

  readonly levels: { value: CompetitionLevel; label: string }[] = [
    { value: 'rookie', label: 'Rookie' },
    { value: 'junior', label: 'Junior' },
    { value: 'pro', label: 'Pro' },
  ];

  readonly filteredCompetitions = computed(() => {
    const filter = this.levelFilter();
    const list = this.competitions();
    if (filter === 'all') return list;
    return list.filter((c) => c.level === filter);
  });

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    locationId: [0, [Validators.required, Validators.min(1)]],
    raceDate: ['', Validators.required],
    raceTime: ['10:00', Validators.required],
    level: ['rookie' as CompetitionLevel, Validators.required],
  });

  ngOnInit(): void {
    this.loadLocations();
    this.loadCompetitions();
  }

  loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (data) => this.locations.set(data),
      error: () => this.error.set('Failed to load venues'),
    });
  }

  loadCompetitions(): void {
    this.loading.set(true);
    this.competitionService.getAll().subscribe({
      next: (data) => {
        this.competitions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load competitions');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(event: Event): void {
    this.levelFilter.set((event.target as HTMLSelectElement).value as 'all' | CompetitionLevel);
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

    this.competitionService
      .create({
        title: raw.title,
        locationId: Number(raw.locationId),
        raceDate: raw.raceDate,
        raceTime: raw.raceTime,
        level: raw.level,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.success.set('Competition created!');
          this.router.navigate(['/competitions', res.competition.id]);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Failed to create competition');
          if (err.error?.errors) this.fieldErrors.set(err.error.errors);
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

import { Component, computed, input, signal } from '@angular/core';
import { TrackRecord } from '../../../models/track-record';
import { VenueLapChart } from '../venue-lap-chart/venue-lap-chart';

export interface VenueChartGroup {
  locationId: number | 'unknown';
  name: string;
  records: TrackRecord[];
}

@Component({
  selector: 'app-track-record-charts',
  imports: [VenueLapChart],
  templateUrl: './track-record-charts.html',
  styleUrl: './track-record-charts.css',
})
export class TrackRecordCharts {
  readonly records = input<TrackRecord[]>([]);

  readonly venueFilter = signal<string>('all');

  readonly venueGroups = computed(() => {
    const groups = new Map<number | 'unknown', VenueChartGroup>();

    for (const record of this.records()) {
      const key = record.locationId ?? 'unknown';
      const name = record.location?.name ?? 'Unknown Venue';
      const existing = groups.get(key);

      if (existing) {
        existing.records.push(record);
      } else {
        groups.set(key, { locationId: key, name, records: [record] });
      }
    }

    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly visibleGroups = computed(() => {
    const filter = this.venueFilter();
    const groups = this.venueGroups();
    if (filter === 'all') return groups;
    return groups.filter((g) => String(g.locationId) === filter);
  });

  readonly hasChartableRecords = computed(() => this.venueGroups().length > 0);

  onFilterChange(event: Event): void {
    this.venueFilter.set((event.target as HTMLSelectElement).value);
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { KartLocation } from '../../models/kart-location';

@Component({
  selector: 'app-locations',
  imports: [RouterLink],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit, AfterViewInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly locationService = inject(LocationService);

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly mapPanel = viewChild<ElementRef<HTMLElement>>('mapPanel');

  readonly locations = signal<KartLocation[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly mapHeight = signal(400);

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private viewReady = false;
  private initStarted = false;

  ngOnInit(): void {
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.locations.set(data);
        this.loading.set(false);
        this.scheduleMapInit();
      },
      error: () => {
        this.error.set('Failed to load kart locations');
        this.loading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.updateMapHeight();
    this.scheduleMapInit();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.map?.remove();
    this.map = null;
  }

  filteredLocations(): KartLocation[] {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.locations();
    return this.locations().filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q)
    );
  }

  selectLocation(loc: KartLocation): void {
    this.selectedId.set(loc.id);
    this.map?.flyTo([loc.latitude, loc.longitude], 14, { duration: 1.2 });
    const marker = this.markers.find(
      (m) => (m as L.Marker & { locationId?: number }).locationId === loc.id
    );
    marker?.openPopup();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  logout(): void {
    this.auth.logout();
  }

  private readonly onWindowResize = (): void => {
    this.updateMapHeight();
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 100);
    }
  };

  private updateMapHeight(): void {
    const panel = this.mapPanel()?.nativeElement;
    if (panel && panel.clientHeight > 0) {
      this.mapHeight.set(panel.clientHeight);
    }
  }

  private scheduleMapInit(): void {
    if (!this.viewReady || this.loading() || this.locations().length === 0 || this.map || this.initStarted) {
      return;
    }

    this.initStarted = true;
    this.updateMapHeight();

    setTimeout(() => {
      this.updateMapHeight();
      const el = this.mapContainer()?.nativeElement;
      if (!el || el.clientHeight < 50) {
        this.initStarted = false;
        setTimeout(() => this.scheduleMapInit(), 100);
        return;
      }
      this.initMap(el);
    }, 150);
  }

  private initMap(el: HTMLDivElement): void {
    const locs = this.locations();

    this.map = L.map(el, {
      center: [5, 110],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    const icon = L.divIcon({
      className: 'kart-marker',
      html: '<div class="kart-marker-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -12],
    });

    this.markers = locs.map((loc) => {
      const marker = L.marker([loc.latitude, loc.longitude], { icon }) as L.Marker & {
        locationId?: number;
      };
      marker.locationId = loc.id;

      const trackInfo = loc.trackLengthKm ? `<br><strong>Track:</strong> ${loc.trackLengthKm} km` : '';
      const hours = loc.openingHours ? `<br><strong>Hours:</strong> ${loc.openingHours}` : '';
      const phone = loc.phone ? `<br><strong>Phone:</strong> ${loc.phone}` : '';
      const website = loc.website
        ? `<br><a href="${loc.website}" target="_blank" rel="noopener">Website</a>`
        : '';

      marker.bindPopup(
        `<div class="map-popup">
          <strong>${loc.name}</strong><br>
          ${loc.address}<br>
          ${loc.city}, ${loc.country}
          ${trackInfo}${hours}${phone}${website}
        </div>`
      );

      marker.on('click', () => this.selectedId.set(loc.id));
      marker.addTo(this.map!);
      return marker;
    });

    setTimeout(() => {
      if (!this.map) return;

      this.map.invalidateSize({ animate: false });

      if (this.markers.length > 0) {
        const group = L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1), { animate: false });
      }
    }, 100);
  }
}

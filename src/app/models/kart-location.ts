export interface KartLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string | null;
  website: string | null;
  phone: string | null;
  openingHours: string | null;
  trackLengthKm: number | null;
  createdAt: string;
}

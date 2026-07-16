export function parseTimeToSeconds(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

export function formatSecondsToTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) return '0:00.000';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const secStr = secs.toFixed(3).padStart(6, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${secStr}`;
  }

  return `${minutes}:${secStr}`;
}

/** Normalize API date values (YYYY-MM-DD or ISO datetime) to a local Date. */
export function parseRaceDate(value: string): Date | null {
  if (!value) return null;

  const datePart = value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRaceDateLabel(value: string): string {
  const date = parseRaceDate(value);
  if (!date) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

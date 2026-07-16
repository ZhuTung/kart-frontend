import {
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  disabled: boolean;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true,
    },
  ],
})
export class DatePicker implements ControlValueAccessor {
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly inputId = input('');
  readonly placeholder = input('Select date');
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);

  readonly value = signal('');
  readonly open = signal(false);
  readonly viewDate = signal(new Date());
  readonly disabled = signal(false);
  readonly pickerView = signal<'days' | 'months' | 'years'>('days');
  readonly yearPageStart = signal(0);

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  readonly displayValue = computed(() => {
    const v = this.value();
    if (!v) return '';
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  });

  readonly monthLabel = computed(() =>
    this.viewDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  readonly viewYear = computed(() => this.viewDate().getFullYear());

  readonly viewMonth = computed(() => this.viewDate().getMonth());

  readonly yearRangeLabel = computed(() => {
    const start = this.yearPageStart();
    return `${start} – ${start + 11}`;
  });

  readonly yearOptions = computed(() =>
    Array.from({ length: 12 }, (_, index) => this.yearPageStart() + index)
  );

  readonly calendarDays = computed(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: CalendarDay[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(this.makeDay(date, false));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(this.makeDay(new Date(year, month, d), true));
    }

    let nextDay = 1;
    while (days.length % 7 !== 0) {
      days.push(this.makeDay(new Date(year, month + 1, nextDay), false));
      nextDay++;
    }

    return days;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = this.root()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.open.set(false);
      this.pickerView.set('days');
    }
  }

  writeValue(value: string): void {
    this.value.set(value || '');
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      this.viewDate.set(new Date(y, m - 1, d));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (this.open()) {
      const v = this.value();
      if (v) {
        const [y, m, d] = v.split('-').map(Number);
        this.viewDate.set(new Date(y, m - 1, d));
      } else {
        this.viewDate.set(new Date());
      }
      this.pickerView.set('days');
    }
  }

  showMonthPicker(event: Event): void {
    event.stopPropagation();
    this.pickerView.set('months');
  }

  showYearPicker(event: Event): void {
    event.stopPropagation();
    this.syncYearPageStart();
    this.pickerView.set('years');
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  prevYear(event: Event): void {
    event.stopPropagation();
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear() - 1, d.getMonth(), 1));
  }

  nextYear(event: Event): void {
    event.stopPropagation();
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear() + 1, d.getMonth(), 1));
  }

  prevYearPage(event: Event): void {
    event.stopPropagation();
    this.yearPageStart.update((start) => start - 12);
  }

  nextYearPage(event: Event): void {
    event.stopPropagation();
    this.yearPageStart.update((start) => start + 12);
  }

  selectMonth(month: number, event: Event): void {
    event.stopPropagation();
    if (this.isMonthDisabled(month)) return;
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), month, 1));
    this.pickerView.set('days');
  }

  selectYear(year: number, event: Event): void {
    event.stopPropagation();
    if (this.isYearDisabled(year)) return;
    const d = this.viewDate();
    this.viewDate.set(new Date(year, d.getMonth(), 1));
    this.pickerView.set('months');
  }

  selectDay(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    if (day.disabled) return;
    this.value.set(day.iso);
    this.onChange(day.iso);
    this.onTouched();
    this.open.set(false);
    this.pickerView.set('days');
  }

  todayIso(): string {
    return toIso(new Date());
  }

  private makeDay(date: Date, inMonth: boolean): CalendarDay {
    const iso = toIso(date);
    return { date, iso, inMonth, disabled: this.isDateDisabled(iso) };
  }

  private isDateDisabled(iso: string): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  }

  isMonthDisabled(month: number): boolean {
    const year = this.viewDate().getFullYear();
    const firstDay = toIso(new Date(year, month, 1));
    const lastDay = toIso(new Date(year, month + 1, 0));
    const min = this.minDate();
    const max = this.maxDate();
    if (min && lastDay < min) return true;
    if (max && firstDay > max) return true;
    return false;
  }

  isYearDisabled(year: number): boolean {
    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;
    const min = this.minDate();
    const max = this.maxDate();
    if (min && lastDay < min) return true;
    if (max && firstDay > max) return true;
    return false;
  }

  private syncYearPageStart(): void {
    const year = this.viewDate().getFullYear();
    this.yearPageStart.set(Math.floor(year / 12) * 12);
  }
}

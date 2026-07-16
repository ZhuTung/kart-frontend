import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { TrackRecord } from '../../../models/track-record';
import { formatSecondsToTime, formatRaceDateLabel, parseRaceDate } from '../../../core/utils/time';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-venue-lap-chart',
  templateUrl: './venue-lap-chart.html',
  styleUrl: './venue-lap-chart.css',
})
export class VenueLapChart implements AfterViewInit, OnDestroy {
  readonly venueName = input.required<string>();
  readonly records = input.required<TrackRecord[]>();

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart<'line'> | null = null;
  private ready = false;

  constructor() {
    effect(() => {
      const recs = this.records();
      if (this.ready) {
        this.renderChart(recs);
      }
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.ready = true;
      this.renderChart(this.records());
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private renderChart(records: TrackRecord[]): void {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas || records.length === 0) return;

    const sorted = [...records].sort(
      (a, b) => (parseRaceDate(a.raceDate)?.getTime() ?? 0) - (parseRaceDate(b.raceDate)?.getTime() ?? 0)
    );
    const labels = sorted.map((r) => formatRaceDateLabel(r.raceDate));
    const avgData = sorted.map((r) => Number(r.averageLapTime));
    const bestData = sorted.map((r) => Number(r.bestLapTime));

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Average Lap',
            data: avgData,
            borderColor: '#00f0ff',
            backgroundColor: 'rgba(0, 240, 255, 0.12)',
            pointBackgroundColor: '#00f0ff',
            pointBorderColor: '#00f0ff',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: 'Hot Lap',
            data: bestData,
            borderColor: '#39ff14',
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            pointBackgroundColor: '#39ff14',
            pointBorderColor: '#39ff14',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: {
              color: '#7a8ba3',
              font: { family: 'Rajdhani, sans-serif', size: 12 },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(10, 14, 26, 0.95)',
            borderColor: 'rgba(0, 240, 255, 0.3)',
            borderWidth: 1,
            titleColor: '#e8f4ff',
            bodyColor: '#e8f4ff',
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y;
                if (value === null || value === undefined) return '';
                return `${ctx.dataset.label}: ${formatSecondsToTime(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            ticks: { color: '#7a8ba3', font: { family: 'Rajdhani, sans-serif', size: 11 } },
            grid: { color: 'rgba(0, 240, 255, 0.08)' },
            border: { color: 'rgba(0, 240, 255, 0.15)' },
          },
          y: {
            type: 'linear',
            reverse: true,
            ticks: {
              color: '#7a8ba3',
              font: { family: 'Rajdhani, sans-serif', size: 11 },
              callback: (value) => formatSecondsToTime(Number(value)),
            },
            grid: { color: 'rgba(0, 240, 255, 0.08)' },
            border: { color: 'rgba(0, 240, 255, 0.15)' },
            title: {
              display: true,
              text: 'Lap Time (faster ↑)',
              color: '#7a8ba3',
              font: { family: 'Rajdhani, sans-serif', size: 11 },
            },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = avgData;
      this.chart.data.datasets[1].data = bestData;
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, config);
  }
}

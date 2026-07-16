import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
  accent: 'cyan' | 'lime' | 'magenta';
}

interface Step {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private readonly auth = inject(AuthService);

  readonly currentYear = new Date().getFullYear();
  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());

  readonly features: Feature[] = [
    {
      icon: '📊',
      title: 'Track Records',
      description:
        'Log every session — race date, venue, laps, average lap, hot lap, total time, and mileage. Auto-calculations keep your data accurate.',
      accent: 'lime',
    },
    {
      icon: '📈',
      title: 'Performance Trends',
      description:
        'Visualize your progress with lap-time charts per venue. Compare average lap vs hot lap over time and watch yourself get faster.',
      accent: 'cyan',
    },
    {
      icon: '📍',
      title: 'Kart Locations',
      description:
        'Browse karting venues across Malaysia on an interactive map. Find tracks, hours, and jump straight into logging a session.',
      accent: 'cyan',
    },
    {
      icon: '🏆',
      title: 'Karting Competitions',
      description:
        'Host or discover race events by venue, date, and time. Filter by Rookie, Junior, or Pro level — review rules, accept T&C, and join the grid.',
      accent: 'lime',
    },
    {
      icon: '📡',
      title: 'Kart Feed',
      description:
        'Share photos and videos from the track. Post titles, descriptions, and get likes from the karting community.',
      accent: 'magenta',
    },
    {
      icon: '👤',
      title: 'Racer Profiles',
      description:
        'View any racer\'s profile — their details and full track record history. Tap a name in the feed to see their stats.',
      accent: 'cyan',
    },
    {
      icon: '🔐',
      title: 'Secure Accounts',
      description:
        'Register your racer credentials, sign in securely, and keep your telemetry private to your account.',
      accent: 'magenta',
    },
  ];

  readonly competitionLevels = ['Rookie', 'Junior', 'Pro'];

  readonly steps: Step[] = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Register with your callsign — every racer starts at Rookie level.',
    },
    {
      number: '02',
      title: 'Log & Explore',
      description: 'Record sessions at real venues, browse the map, and share your best moments.',
    },
    {
      number: '03',
      title: 'Compete & Improve',
      description: 'Join karting competitions, accept the rules, and track your lap-time progress.',
    },
  ];

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${sectionId}`);
  }
}

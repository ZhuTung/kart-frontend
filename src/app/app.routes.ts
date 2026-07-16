import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'track-records',
    loadComponent: () => import('./pages/track-records/track-records').then((m) => m.TrackRecords),
    canActivate: [authGuard],
  },
  {
    path: 'locations',
    loadComponent: () => import('./pages/locations/locations').then((m) => m.Locations),
    canActivate: [authGuard],
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed').then((m) => m.Feed),
    canActivate: [authGuard],
  },
  {
    path: 'competitions',
    loadComponent: () => import('./pages/competitions/competitions').then((m) => m.Competitions),
    canActivate: [authGuard],
  },
  {
    path: 'competitions/:id',
    loadComponent: () =>
      import('./pages/competition-detail/competition-detail').then((m) => m.CompetitionDetail),
    canActivate: [authGuard],
  },
  {
    path: 'profile/:userId',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];

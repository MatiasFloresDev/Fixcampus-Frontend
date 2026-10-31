import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';

export const routes: Routes = [
  { path: '', component: Homecomponent, title: 'FixCampus | Inicio' },
  { path: '**', redirectTo: '' },
];

import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Evidenciascomponent } from './components/evidenciascomponent/evidenciascomponent';
import { Accesoservice } from './services/accesoservice';

const revisarSesion: CanActivateFn = () => {
  const acceso = inject(Accesoservice);
  const router = inject(Router);
  if (!acceso.tieneSesion()) return router.createUrlTree(['/acceso']);
  return true;
};

const revisarInvitado: CanActivateFn = () => {
  const acceso = inject(Accesoservice);
  if (!acceso.tieneSesion()) return true;
  return inject(Router).createUrlTree(['/panel']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'acceso', pathMatch: 'full' },
  {
    path: 'acceso',
    component: Accesocomponent,
    canActivate: [revisarInvitado],
    title: 'Iniciar sesión | FixCampus',
  },
  {
    path: 'crear-cuenta',
    component: Registrocomponent,
    canActivate: [revisarInvitado],
    title: 'Crear cuenta | FixCampus',
  },
  {
    path: 'panel',
    component: Panelcomponent,
    canActivate: [revisarSesion],
    title: 'Panel | FixCampus',
  },
  {
    path: 'evidencias',
    component: Evidenciascomponent,
    canActivate: [revisarSesion],
    title: 'Evidencias | FixCampus',
  },
  {
    path: 'reportar',
    canActivate: [revisarSesion],
    loadComponent: () =>
      import('./components/reporteformcomponent/reporteformcomponent').then(
        (m) => m.Reporteformcomponent,
      ),
    title: 'Nueva incidencia | FixCampus',
  },
  {
    path: 'reportes/:id/editar',
    canActivate: [revisarSesion],
    loadComponent: () =>
      import('./components/reporteformcomponent/reporteformcomponent').then(
        (m) => m.Reporteformcomponent,
      ),
    title: 'Editar incidencia | FixCampus',
  },
  { path: '**', redirectTo: 'acceso' },
];

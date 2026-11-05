import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Evidenciascomponent } from './components/evidenciascomponent/evidenciascomponent';
import { Accesoservice } from './services/accesoservice';

const revisarSesion: CanActivateFn = (ruta) => {
  const acceso = inject(Accesoservice);
  const router = inject(Router);
  if (!acceso.tieneSesion()) return router.createUrlTree(['/acceso']);
  if (ruta.data['admin'] && acceso.rol() !== 'ADMIN') return router.createUrlTree(['/evidencias']);
  return true;
};

const revisarInvitado: CanActivateFn = () => {
  const acceso = inject(Accesoservice);
  if (!acceso.tieneSesion()) return true;
  return inject(Router).createUrlTree([acceso.rol() === 'ADMIN' ? '/panel' : '/evidencias']);
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
    data: { admin: true },
    title: 'Panel | FixCampus',
  },
  {
    path: 'evidencias',
    component: Evidenciascomponent,
    canActivate: [revisarSesion],
    title: 'Evidencias | FixCampus',
  },
  { path: '**', redirectTo: 'acceso' },
];

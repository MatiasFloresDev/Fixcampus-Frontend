import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Evidenciascomponent } from './components/evidenciascomponent/evidenciascomponent';
import { catalogos } from './models/CatalogoDTO';
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

const revisarAdmin: CanActivateFn = () => {
  const acceso = inject(Accesoservice);
  const router = inject(Router);
  if (!acceso.tieneSesion()) return router.createUrlTree(['/acceso']);
  return acceso.rol() === 'ADMIN' || router.createUrlTree(['/panel']);
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/iniciocomponent/iniciocomponent').then((m) => m.Iniciocomponent),
    title: 'Inicio | FixCampus',
  },
  {
    path: 'guia-de-estilos',
    loadComponent: () =>
      import('./components/guiacomponent/guiacomponent').then((m) => m.Guiacomponent),
    title: 'Guía de estilos | FixCampus',
  },
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
  {
    path: 'reportes/:id/mapa',
    canActivate: [revisarSesion],
    loadComponent: () =>
      import('./components/mapacomponent/mapacomponent').then((m) => m.Mapacomponent),
    title: 'Mapa del reporte | FixCampus',
  },
  {
    path: 'administracion/recomendaciones',
    canActivate: [revisarAdmin],
    loadComponent: () =>
      import('./components/recomendacionescomponent/recomendacionescomponent').then(
        (m) => m.Recomendacionescomponent,
      ),
    title: 'Recomendaciones | FixCampus',
  },
  ...Object.entries(catalogos).map(([ruta, catalogo]) => ({
    path: 'administracion/' + ruta,
    canActivate: [revisarAdmin],
    data: { catalogo },
    loadComponent: () =>
      import('./components/catalogocomponent/catalogocomponent').then((m) => m.Catalogocomponent),
    title: catalogo.titulo + ' | FixCampus',
  })),
  { path: '**', redirectTo: '' },
];

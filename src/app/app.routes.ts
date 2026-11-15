import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Evidenciascomponent } from './components/evidenciascomponent/evidenciascomponent';
import { Iniciocomponent } from './components/iniciocomponent/iniciocomponent';
import { Reporteformcomponent } from './components/reporteformcomponent/reporteformcomponent';
import { Mapacomponent } from './components/mapacomponent/mapacomponent';
import { Seguimientocomponent } from './components/seguimientocomponent/seguimientocomponent';
import { Usuarioscomponent } from './components/usuarioscomponent/usuarioscomponent';
import { Estadisticascomponent } from './components/estadisticascomponent/estadisticascomponent';
import { Recomendacionescomponent } from './components/recomendacionescomponent/recomendacionescomponent';
import { Categoriacomponent } from './components/categoriacomponent/categoriacomponent';
import { Ubicacioncomponent } from './components/ubicacioncomponent/ubicacioncomponent';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
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
    component: Iniciocomponent,
    title: 'Inicio | FixCampus',
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
    component: Reporteformcomponent,
    title: 'Nueva incidencia | FixCampus',
  },
  {
    path: 'reportes/:id/editar',
    canActivate: [revisarSesion],
    component: Reporteformcomponent,
    title: 'Editar incidencia | FixCampus',
  },
  {
    path: 'reportes/:id/mapa',
    canActivate: [revisarSesion],
    component: Mapacomponent,
    title: 'Mapa del reporte | FixCampus',
  },
  {
    path: 'reportes/:id/seguimiento',
    canActivate: [revisarAdmin],
    component: Seguimientocomponent,
    title: 'Seguimiento | FixCampus',
  },
  {
    path: 'administracion/usuarios',
    canActivate: [revisarAdmin],
    component: Usuarioscomponent,
    title: 'Usuarios | FixCampus',
  },
  {
    path: 'administracion/estadisticas',
    canActivate: [revisarAdmin],
    component: Estadisticascomponent,
    title: 'Estadísticas | FixCampus',
  },
  {
    path: 'administracion/recomendaciones',
    canActivate: [revisarAdmin],
    component: Recomendacionescomponent,
    title: 'Recomendaciones | FixCampus',
  },
  {
    path: 'administracion/categorias',
    component: Categoriacomponent,
    canActivate: [revisarAdmin],
    title: 'Categorías | FixCampus',
  },
  {
    path: 'administracion/ubicaciones',
    component: Ubicacioncomponent,
    canActivate: [revisarAdmin],
    title: 'Ubicaciones | FixCampus',
  },
  {
    path: 'administracion/roles',
    component: Rolcomponent,
    canActivate: [revisarAdmin],
    title: 'Roles | FixCampus',
  },
  { path: '**', redirectTo: '' },
];

import { Mapacomponent } from './components/mapacomponent/mapacomponent';
import { Notificacionescomponent } from './components/notificacionescomponent/notificacionescomponent';
import { Routes } from '@angular/router';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Categoriacomponent } from './components/categoriacomponent/categoriacomponent';
import { Clistcomponent } from './components/categoriacomponent/clistcomponent/clistcomponent';
import { Cinsertcomponent } from './components/categoriacomponent/cinsertcomponent/cinsertcomponent';
import { Cupdatecomponent } from './components/categoriacomponent/cupdatecomponent/cupdatecomponent';
import { Cdetallecomponent } from './components/categoriacomponent/cdetallecomponent/cdetallecomponent';
import { Ubicacioncomponent } from './components/ubicacioncomponent/ubicacioncomponent';
import { Ulistcomponent } from './components/ubicacioncomponent/ulistcomponent/ulistcomponent';
import { Uinsertcomponent } from './components/ubicacioncomponent/uinsertcomponent/uinsertcomponent';
import { Uupdatecomponent } from './components/ubicacioncomponent/uupdatecomponent/uupdatecomponent';
import { Udetallecomponent } from './components/ubicacioncomponent/udetallecomponent/udetallecomponent';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
import { Rlistcomponent } from './components/rolcomponent/rlistcomponent/rlistcomponent';
import { Rinsertcomponent } from './components/rolcomponent/rinsertcomponent/rinsertcomponent';
import { Rupdatecomponent } from './components/rolcomponent/rupdatecomponent/rupdatecomponent';
import { Rdetallecomponent } from './components/rolcomponent/rdetallecomponent/rdetallecomponent';
import { Reportecomponent } from './components/reportecomponent/reportecomponent';
import { Replistcomponent } from './components/reportecomponent/replistcomponent/replistcomponent';
import { Repinsertcomponent } from './components/reportecomponent/repinsertcomponent/repinsertcomponent';
import { Repupdatecomponent } from './components/reportecomponent/repupdatecomponent/repupdatecomponent';
import { Repdetallecomponent } from './components/reportecomponent/repdetallecomponent/repdetallecomponent';
import { Comentariocomponent } from './components/comentariocomponent/comentariocomponent';
import { Comlistcomponent } from './components/comentariocomponent/comlistcomponent/comlistcomponent';
import { Cominsertcomponent } from './components/comentariocomponent/cominsertcomponent/cominsertcomponent';
import { Comupdatecomponent } from './components/comentariocomponent/comupdatecomponent/comupdatecomponent';
import { Comdetallecomponent } from './components/comentariocomponent/comdetallecomponent/comdetallecomponent';
import { Adjuntocomponent } from './components/adjuntocomponent/adjuntocomponent';
import { Adjlistcomponent } from './components/adjuntocomponent/adjlistcomponent/adjlistcomponent';
import { Adjinsertcomponent } from './components/adjuntocomponent/adjinsertcomponent/adjinsertcomponent';
import { Adjupdatecomponent } from './components/adjuntocomponent/adjupdatecomponent/adjupdatecomponent';
import { Adjdetallecomponent } from './components/adjuntocomponent/adjdetallecomponent/adjdetallecomponent';
import { Recomendacioncomponent } from './components/recomendacioncomponent/recomendacioncomponent';
import { Reclistcomponent } from './components/recomendacioncomponent/reclistcomponent/reclistcomponent';
import { Recinsertcomponent } from './components/recomendacioncomponent/recinsertcomponent/recinsertcomponent';
import { Recupdatecomponent } from './components/recomendacioncomponent/recupdatecomponent/recupdatecomponent';
import { Recdetallecomponent } from './components/recomendacioncomponent/recdetallecomponent/recdetallecomponent';
import { Usuariocomponent } from './components/usuariocomponent/usuariocomponent';
import { Usulistcomponent } from './components/usuariocomponent/usulistcomponent/usulistcomponent';
import { Usuinsertcomponent } from './components/usuariocomponent/usuinsertcomponent/usuinsertcomponent';
import { Usuupdatecomponent } from './components/usuariocomponent/usuupdatecomponent/usuupdatecomponent';
import { Usudetallecomponent } from './components/usuariocomponent/usudetallecomponent/usudetallecomponent';
import { Estadisticacomponent } from './components/estadisticacomponent/estadisticacomponent';
import { Reporte01component } from './components/estadisticacomponent/reporte01component/reporte01component';
import { Reporte02component } from './components/estadisticacomponent/reporte02component/reporte02component';
import { Reporte03component } from './components/estadisticacomponent/reporte03component/reporte03component';
import { Reporte04component } from './components/estadisticacomponent/reporte04component/reporte04component';
import { Reporte05component } from './components/estadisticacomponent/reporte05component/reporte05component';
import { Reporte06component } from './components/estadisticacomponent/reporte06component/reporte06component';
import { Reporte07component } from './components/estadisticacomponent/reporte07component/reporte07component';
import { Reporte08component } from './components/estadisticacomponent/reporte08component/reporte08component';
import { Reporte09component } from './components/estadisticacomponent/reporte09component/reporte09component';
import { Reporte10component } from './components/estadisticacomponent/reporte10component/reporte10component';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'reportes/mapa/:id', component: Mapacomponent, canActivate: [authGuard] },
  {
    path: 'notificaciones',
    component: Notificacionescomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  { path: 'login', component: Logincomponent },
  { path: 'crear-cuenta', component: Usuinsertcomponent, data: { publico: true } },
  { path: '', component: Homecomponent, pathMatch: 'full' },

  {
    path: 'categorias',
    component: Categoriacomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        component: Clistcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
      {
        path: 'insertar',
        component: Cinsertcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'editar/:id',
        component: Cupdatecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'detalle/:id',
        component: Cdetallecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
    ],
  },

  {
    path: 'ubicaciones',
    component: Ubicacioncomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        component: Ulistcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
      {
        path: 'insertar',
        component: Uinsertcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'editar/:id',
        component: Uupdatecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'detalle/:id',
        component: Udetallecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
    ],
  },

  {
    path: 'roles',
    component: Rolcomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Rlistcomponent },
      { path: 'insertar', component: Rinsertcomponent },
      { path: 'editar/:id', component: Rupdatecomponent },
      { path: 'detalle/:id', component: Rdetallecomponent },
    ],
  },

  {
    path: 'reportes',
    component: Reportecomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Replistcomponent },
      {
        path: 'insertar',
        component: Repinsertcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO'] },
      },
      {
        path: 'editar/:id',
        component: Repupdatecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO'] },
      },
      { path: 'detalle/:id', component: Repdetallecomponent },
    ],
  },

  {
    path: 'comentarios',
    data: { roles: ['ADMIN'] },
    component: Comentariocomponent,
    canActivate: [authGuard, roleGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Comlistcomponent },
      { path: 'insertar', component: Cominsertcomponent },
      { path: 'editar/:id', component: Comupdatecomponent },
      { path: 'detalle/:id', component: Comdetallecomponent },
    ],
  },

  {
    path: 'adjuntos',
    data: { roles: ['ADMIN'] },
    component: Adjuntocomponent,
    canActivate: [authGuard, roleGuard],
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Adjlistcomponent },
      {
        path: 'insertar',
        component: Adjinsertcomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO'] },
      },
      {
        path: 'editar/:id',
        component: Adjupdatecomponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      { path: 'detalle/:id', component: Adjdetallecomponent },
    ],
  },

  {
    path: 'recomendaciones',
    component: Recomendacioncomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Reclistcomponent },
      { path: 'insertar', component: Recinsertcomponent },
      { path: 'editar/:id', component: Recupdatecomponent },
      { path: 'detalle/:id', component: Recdetallecomponent },
    ],
  },

  {
    path: 'usuarios',
    component: Usuariocomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Usulistcomponent },
      { path: 'insertar', component: Usuinsertcomponent },
      { path: 'editar/:id', component: Usuupdatecomponent },
      { path: 'detalle/:id', component: Usudetallecomponent },
    ],
  },

  {
    path: 'estadisticas',
    component: Estadisticacomponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'reporte05', pathMatch: 'full' },
      {
        path: 'reporte01',
        component: Reporte01component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte02',
        component: Reporte02component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte03',
        component: Reporte03component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte04',
        component: Reporte04component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte05',
        component: Reporte05component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
      {
        path: 'reporte06',
        component: Reporte06component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
      {
        path: 'reporte07',
        component: Reporte07component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte08',
        component: Reporte08component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'USUARIO', 'TECNICO'] },
      },
      {
        path: 'reporte09',
        component: Reporte09component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'reporte10',
        component: Reporte10component,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

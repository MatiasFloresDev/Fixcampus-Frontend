import { Routes } from '@angular/router';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Categoriacomponent } from './components/categoriacomponent/categoriacomponent';
import { Categoriaformcomponent } from './components/categoriacomponent/categoriaformcomponent/categoriaformcomponent';
import { Categorialistcomponent } from './components/categoriacomponent/categorialistcomponent/categorialistcomponent';
import { Comentarioformcomponent } from './components/comentarioformcomponent/comentarioformcomponent';
import { Comentarioscomponent } from './components/comentarioscomponent/comentarioscomponent';
import { Estadisticascomponent } from './components/estadisticascomponent/estadisticascomponent';
import { Iniciocomponent } from './components/iniciocomponent/iniciocomponent';
import { Mapacomponent } from './components/mapacomponent/mapacomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Recomendacionescomponent } from './components/recomendacionescomponent/recomendacionescomponent';
import { Recomendacionformcomponent } from './components/recomendacionformcomponent/recomendacionformcomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Reportedetallecomponent } from './components/reportedetallecomponent/reportedetallecomponent';
import { Reporteformcomponent } from './components/reporteformcomponent/reporteformcomponent';
import { Reportelistcomponent } from './components/reportelistcomponent/reportelistcomponent';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
import { Rolformcomponent } from './components/rolcomponent/rolformcomponent/rolformcomponent';
import { Rollistcomponent } from './components/rolcomponent/rollistcomponent/rollistcomponent';
import { Seguimientocomponent } from './components/seguimientocomponent/seguimientocomponent';
import { Ubicacioncomponent } from './components/ubicacioncomponent/ubicacioncomponent';
import { Ubicacionformcomponent } from './components/ubicacioncomponent/ubicacionformcomponent/ubicacionformcomponent';
import { Ubicacionlistcomponent } from './components/ubicacioncomponent/ubicacionlistcomponent/ubicacionlistcomponent';
import { Usuarioformcomponent } from './components/usuarioscomponent/usuarioformcomponent/usuarioformcomponent';
import { Usuariolistcomponent } from './components/usuarioscomponent/usuariolistcomponent/usuariolistcomponent';
import { Usuarioscomponent } from './components/usuarioscomponent/usuarioscomponent';

export const routes: Routes = [
  {
    path: '',
    component: Iniciocomponent,
    title: 'Inicio | FixCampus',
  },
  {
    path: 'acceso',
    component: Accesocomponent,

    title: 'Iniciar sesión | FixCampus',
  },
  {
    path: 'crear-cuenta',
    component: Registrocomponent,

    title: 'Crear cuenta | FixCampus',
  },
  {
    path: 'panel',
    component: Panelcomponent,

    title: 'Panel | FixCampus',
  },
  {
    path: 'evidencias',
    component: Reportelistcomponent,

    title: 'Evidencias | FixCampus',
  },
  {
    path: 'reportar',

    component: Reporteformcomponent,
    title: 'Nueva incidencia | FixCampus',
  },
  {
    path: 'reportes/:id/editar',

    component: Reporteformcomponent,
    title: 'Editar incidencia | FixCampus',
  },
  {
    path: 'reportes/:id/mapa',

    component: Mapacomponent,
    title: 'Mapa del reporte | FixCampus',
  },
  {
    path: 'reportes/:id/seguimiento',

    component: Seguimientocomponent,
    children: [
      { path: '', redirectTo: 'comentarios', pathMatch: 'full' },
      { path: 'comentarios', component: Comentarioscomponent },
      { path: 'comentarios/insertar', component: Comentarioformcomponent },
      { path: 'comentarios/editar/:comentarioId', component: Comentarioformcomponent },
      { path: 'recomendacion', component: Recomendacionformcomponent },
    ],
    title: 'Seguimiento | FixCampus',
  },
  {
    path: 'administracion/usuarios',

    component: Usuarioscomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Usuariolistcomponent },
      { path: 'insertar', component: Usuarioformcomponent },
      { path: 'editar/:id', component: Usuarioformcomponent },
      { path: 'detalle/:id', component: Usuarioformcomponent, data: { detalle: true } },
    ],
    title: 'Usuarios | FixCampus',
  },
  {
    path: 'administracion/estadisticas',

    component: Estadisticascomponent,
    title: 'Estadísticas | FixCampus',
  },
  {
    path: 'administracion/recomendaciones',

    component: Recomendacionescomponent,
    title: 'Recomendaciones | FixCampus',
  },
  {
    path: 'administracion/categorias',
    component: Categoriacomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Categorialistcomponent },
      { path: 'insertar', component: Categoriaformcomponent },
      { path: 'editar/:id', component: Categoriaformcomponent },
      { path: 'detalle/:id', component: Categoriaformcomponent, data: { detalle: true } },
    ],

    title: 'Categorías | FixCampus',
  },
  {
    path: 'administracion/ubicaciones',
    component: Ubicacioncomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Ubicacionlistcomponent },
      { path: 'insertar', component: Ubicacionformcomponent },
      { path: 'editar/:id', component: Ubicacionformcomponent },
      { path: 'detalle/:id', component: Ubicacionformcomponent, data: { detalle: true } },
    ],

    title: 'Ubicaciones | FixCampus',
  },
  {
    path: 'administracion/roles',
    component: Rolcomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Rollistcomponent },
      { path: 'insertar', component: Rolformcomponent },
      { path: 'editar/:id', component: Rolformcomponent },
      { path: 'detalle/:id', component: Rolformcomponent, data: { detalle: true } },
    ],

    title: 'Roles | FixCampus',
  },
  {
    path: 'reportes/:id',
    component: Reportedetallecomponent,
    title: 'Detalle del reporte | FixCampus',
  },
  { path: '**', redirectTo: '' },
];

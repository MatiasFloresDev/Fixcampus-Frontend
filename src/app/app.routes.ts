import { Routes } from '@angular/router';
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
    component: Evidenciascomponent,

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
    title: 'Seguimiento | FixCampus',
  },
  {
    path: 'administracion/usuarios',

    component: Usuarioscomponent,
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

    title: 'Categorías | FixCampus',
  },
  {
    path: 'administracion/ubicaciones',
    component: Ubicacioncomponent,

    title: 'Ubicaciones | FixCampus',
  },
  {
    path: 'administracion/roles',
    component: Rolcomponent,

    title: 'Roles | FixCampus',
  },
  { path: '**', redirectTo: '' },
];

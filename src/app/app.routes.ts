import { Routes } from '@angular/router';
import { Listarcategoriacomponent } from './components/categoriacomponent/listarcategoriacomponent/listarcategoriacomponent';
import { Listarubicacioncomponent } from './components/ubicacioncomponent/listarubicacioncomponent/listarubicacioncomponent';
import { Listarrolcomponent } from './components/rolcomponent/listarrolcomponent/listarrolcomponent';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';

export const routes: Routes = [
  { path: '', redirectTo: 'categorias/listar', pathMatch: 'full' },
  {
    path: 'categorias/listar',
    component: Listarcategoriacomponent,
    title: 'Categorías | FixCampus',
  },
  {
    path: 'ubicaciones/listar',
    component: Listarubicacioncomponent,
    title: 'Ubicaciones | FixCampus',
  },
  { path: 'roles/listar', component: Listarrolcomponent, title: 'Roles | FixCampus' },
  { path: 'acceso', component: Accesocomponent, title: 'Iniciar sesión | FixCampus' },
  { path: '**', redirectTo: 'categorias/listar' },
];

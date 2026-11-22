import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TotalCategoriaDTO } from '../models/TotalCategoriaDTO';
import { TotalPrioridadDTO } from '../models/TotalPrioridadDTO';
import { UsuariosPorRolDTO } from '../models/UsuariosPorRolDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Estadisticaservice {
  private api = environment.base + '/api';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  reportesPorCategoria(): Observable<TotalCategoriaDTO[]> {
    return this.http.get<TotalCategoriaDTO[]>(this.api + '/categories/reporte-por-categoria', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  usuariosPorRol(): Observable<UsuariosPorRolDTO[]> {
    return this.http.get<UsuariosPorRolDTO[]>(this.api + '/users/por-rol', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  recomendacionesPorPrioridad(): Observable<TotalPrioridadDTO[]> {
    return this.http.get<TotalPrioridadDTO[]>(
      this.api + '/recomendaciones/estadisticas/por-prioridad-reporte',
      {
        headers: this.acceso.obtenerCabeceras(),
      },
    );
  }
}

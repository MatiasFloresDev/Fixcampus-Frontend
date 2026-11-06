import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdjuntoDTO,
  CategoriaDTO,
  IncidenciasPorMesDTO,
  ReporteDTO,
  ReporteFormularioDTO,
  SugerenciaCategoriaDTO,
  UbicacionDTO,
} from '../models/ReporteDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Reporteservice {
  private api = environment.base + '/api';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(prioridad = ''): Observable<ReporteDTO[]> {
    const ruta = prioridad
      ? '/reports/prioridad/' + encodeURIComponent(prioridad)
      : this.acceso.rol() === 'ADMIN'
        ? '/reports'
        : '/reports/mis-reportes';
    return this.http.get<ReporteDTO[]>(this.api + ruta, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  obtener(id: number): Observable<ReporteDTO> {
    return this.http.get<ReporteDTO>(this.api + '/reports/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(datos: ReporteFormularioDTO): Observable<ReporteDTO> {
    return this.http.post<ReporteDTO>(this.api + '/reports', datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  actualizar(id: number, datos: ReporteFormularioDTO): Observable<ReporteDTO> {
    return this.http.put<ReporteDTO>(this.api + '/reports/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/reports/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  sugerirCategoria(descripcion: string): Observable<SugerenciaCategoriaDTO> {
    return this.http.post<SugerenciaCategoriaDTO>(
      this.api + '/reports/sugerir-categoria',
      { descripcion },
      { headers: this.acceso.obtenerCabeceras() },
    );
  }

  categorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.api + '/categories', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  buscarCategorias(palabraClave: string): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.api + '/categories/buscar-descripcion', {
      headers: this.acceso.obtenerCabeceras(),
      params: { palabraClave },
    });
  }

  ubicaciones(): Observable<UbicacionDTO[]> {
    return this.http.get<UbicacionDTO[]>(this.api + '/locations', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  ubicacion(id: number): Observable<UbicacionDTO> {
    return this.http.get<UbicacionDTO>(this.api + '/locations/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  incidenciasPorMes(): Observable<IncidenciasPorMesDTO[]> {
    return this.http.get<IncidenciasPorMesDTO[]>(
      this.api + '/reports/estadisticas/por-usuario-mes',
      { headers: this.acceso.obtenerCabeceras() },
    );
  }

  contarUsuarios(): Observable<number> {
    return this.http.get<number>(this.api + '/users/count', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  evidencias(idReporte: number): Observable<AdjuntoDTO[]> {
    return this.http.get<AdjuntoDTO[]>(this.api + '/attachments/reporte/' + idReporte, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
}

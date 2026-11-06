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

  listar(): Observable<ReporteDTO[]> {
    const ruta = this.acceso.rol() === 'ADMIN' ? '/reports' : '/reports/mis-reportes';
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

  categorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.api + '/categories', {
      headers: this.acceso.obtenerCabeceras(),
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

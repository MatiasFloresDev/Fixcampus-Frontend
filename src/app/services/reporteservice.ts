import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IncidenciasPorMesDTO } from '../models/IncidenciasPorMesDTO';
import { ReporteDTO } from '../models/ReporteDTO';
import { ReporteFormularioDTO } from '../models/ReporteFormularioDTO';
import { SugerenciaCategoriaDTO } from '../models/SugerenciaCategoriaDTO';
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

  incidenciasPorMes(): Observable<IncidenciasPorMesDTO[]> {
    return this.http.get<IncidenciasPorMesDTO[]>(
      this.api + '/reports/estadisticas/por-usuario-mes',
      { headers: this.acceso.obtenerCabeceras() },
    );
  }
}

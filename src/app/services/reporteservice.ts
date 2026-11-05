import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdjuntoDTO, IncidenciasPorMesDTO, ReporteDTO } from '../models/ReporteDTO';
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

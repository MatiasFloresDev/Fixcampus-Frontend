import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecomendacionDTOInsert } from '../models/RecomendacionDTOInsert';
import { RecomendacionDTOUpdate } from '../models/RecomendacionDTOUpdate';
import { RecomendacionDTOList } from '../models/RecomendacionDTOList';
import { RecomendacionesPorPrioridadReporteDTO } from '../models/RecomendacionesPorPrioridadReporteDTO';

@Injectable({ providedIn: 'root' })
export class Recomendacionservice {
  private apiURL = environment.base + '/api/recomendaciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<RecomendacionDTOList[]> {
    return this.http.get<RecomendacionDTOList[]>(this.apiURL);
  }

  buscarPorId(id: number): Observable<RecomendacionDTOList> {
    return this.http.get<RecomendacionDTOList>(this.apiURL + '/' + id);
  }

  registrar(dto: RecomendacionDTOInsert): Observable<RecomendacionDTOList> {
    return this.http.post<RecomendacionDTOList>(this.apiURL, dto);
  }

  actualizar(id: number, dto: RecomendacionDTOUpdate): Observable<RecomendacionDTOList> {
    return this.http.put<RecomendacionDTOList>(this.apiURL + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }

  contarPorPrioridadReporte(): Observable<RecomendacionesPorPrioridadReporteDTO[]> {
    return this.http.get<RecomendacionesPorPrioridadReporteDTO[]>(
      this.apiURL + '/estadisticas/por-prioridad-reporte',
    );
  }

  buscarPorPrioridad(prioridad: string): Observable<RecomendacionDTOList[]> {
    return this.http.get<RecomendacionDTOList[]>(this.apiURL + '/prioridad', {
      params: { prioridad },
    });
  }
}

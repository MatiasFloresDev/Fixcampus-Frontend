import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReporteDTOInsert } from '../models/ReporteDTOInsert';
import { ReporteDTOUpdate } from '../models/ReporteDTOUpdate';
import { ReporteDTOList } from '../models/ReporteDTOList';
import { IncidenciasPorMesDTO } from '../models/IncidenciasPorMesDTO';
import { IncidenciasPorCategoriaDTO } from '../models/IncidenciasPorCategoriaDTO';

@Injectable({ providedIn: 'root' })
export class Reporteservice {
  private apiURL = environment.base + '/api/reports';

  constructor(private http: HttpClient) {}

  listar(): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL);
  }

  buscarPorId(id: number): Observable<ReporteDTOList> {
    return this.http.get<ReporteDTOList>(this.apiURL + '/' + id);
  }

  registrar(dto: ReporteDTOInsert): Observable<ReporteDTOList> {
    return this.http.post<ReporteDTOList>(this.apiURL, dto);
  }

  actualizar(id: number, dto: ReporteDTOUpdate): Observable<ReporteDTOList> {
    return this.http.put<ReporteDTOList>(this.apiURL + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
  incidenciasPorCategoria(): Observable<IncidenciasPorCategoriaDTO[]> {
    return this.http.get<IncidenciasPorCategoriaDTO[]>(
      this.apiURL + '/estadisticas/por-categoria',
    );
  }

  incidenciasPorUsuarioYMes(): Observable<IncidenciasPorMesDTO[]> {
    return this.http.get<IncidenciasPorMesDTO[]>(
      this.apiURL + '/estadisticas/por-usuario-mes',
    );
  }

  buscarPorEstado(estado: string): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL, { params: { estado } });
  }

  buscarPorCategoria(categoria: string): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL, { params: { categoria } });
  }

  buscarPorPrioridad(prioridad: string): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL + '/prioridad/' + prioridad);
  }

  buscarPorCorreo(correo: string): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL, { params: { correo } });
  }

  misReportes(): Observable<ReporteDTOList[]> {
    return this.http.get<ReporteDTOList[]>(this.apiURL + '/mis-reportes');
  }
}

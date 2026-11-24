import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdjuntoDTOUpdate } from '../models/AdjuntoDTOUpdate';
import { AdjuntoDTOInsert } from '../models/AdjuntoDTOInsert';
import { AdjuntoDTOList } from '../models/AdjuntoDTOList';

@Injectable({ providedIn: 'root' })
export class Adjuntoservice {
  private apiURL = environment.base + '/api/attachments';

  constructor(private http: HttpClient) {}

  listarPorReporte(reporteId: number): Observable<AdjuntoDTOList[]> {
    return this.http.get<AdjuntoDTOList[]>(this.apiURL + '/reporte/' + reporteId);
  }

  registrar(dto: AdjuntoDTOInsert): Observable<AdjuntoDTOList> {
    return this.http.post<AdjuntoDTOList>(this.apiURL, dto);
  }

  listar(): Observable<AdjuntoDTOList[]> {
    return this.http.get<AdjuntoDTOList[]>(this.apiURL);
  }

  buscarPorId(id: number): Observable<AdjuntoDTOList> {
    return this.http.get<AdjuntoDTOList>(this.apiURL + '/' + id);
  }

  actualizar(id: number, dto: AdjuntoDTOUpdate): Observable<AdjuntoDTOList> {
    return this.http.put<AdjuntoDTOList>(this.apiURL + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
}

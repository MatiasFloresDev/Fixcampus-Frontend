import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ComentarioDTOUpdate } from '../models/ComentarioDTOUpdate';
import { ComentarioDTOInsert } from '../models/ComentarioDTOInsert';
import { ComentarioDTOList } from '../models/ComentarioDTOList';

@Injectable({ providedIn: 'root' })
export class Comentarioservice {
  private apiURL = environment.base + '/api/comments';

  constructor(private http: HttpClient) {}

  listarPorReporte(reporteId: number): Observable<ComentarioDTOList[]> {
    return this.http.get<ComentarioDTOList[]>(this.apiURL, { params: { reporteId } });
  }

  registrar(dto: ComentarioDTOInsert): Observable<ComentarioDTOList> {
    return this.http.post<ComentarioDTOList>(this.apiURL, dto);
  }

  listar(): Observable<ComentarioDTOList[]> {
    return this.http.get<ComentarioDTOList[]>(this.apiURL);
  }

  buscarPorId(id: number): Observable<ComentarioDTOList> {
    return this.http.get<ComentarioDTOList>(this.apiURL + '/' + id);
  }

  actualizar(id: number, dto: ComentarioDTOUpdate): Observable<ComentarioDTOList> {
    return this.http.put<ComentarioDTOList>(this.apiURL + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
}

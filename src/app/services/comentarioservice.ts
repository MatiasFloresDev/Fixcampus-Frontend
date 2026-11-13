import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ComentarioDTO } from '../models/ComentarioDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Comentarioservice {
  private readonly base = environment.base + '/api/comments';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(reporteId: number): Observable<ComentarioDTO[]> {
    return this.http.get<ComentarioDTO[]>(this.base + '/reporte/' + reporteId, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(reporteId: number, textoComentario: string): Observable<ComentarioDTO> {
    return this.http.post<ComentarioDTO>(
      this.base + '/reporte/' + reporteId,
      { textoComentario },
      {
        headers: this.acceso.obtenerCabeceras(),
      },
    );
  }

  actualizar(comentario: ComentarioDTO, textoComentario: string): Observable<ComentarioDTO> {
    const { reporteId, usuarioId } = comentario;
    return this.http.put<ComentarioDTO>(
      this.base + '/' + comentario.idComentario,
      { reporteId, usuarioId, textoComentario },
      { headers: this.acceso.obtenerCabeceras() },
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.base + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
}

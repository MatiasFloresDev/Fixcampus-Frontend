import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ComentarioDTO } from '../models/ComentarioDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Comentarioservice {
  private readonly http = inject(HttpClient);
  private readonly acceso = inject(Accesoservice);
  private readonly base = environment.base + '/api/comments';

  listar(reporteId: number) {
    return this.http.get<ComentarioDTO[]>(this.base + '/reporte/' + reporteId, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(reporteId: number, textoComentario: string) {
    return this.http.post<ComentarioDTO>(
      this.base + '/reporte/' + reporteId,
      { textoComentario },
      {
        headers: this.acceso.obtenerCabeceras(),
      },
    );
  }

  actualizar(comentario: ComentarioDTO, textoComentario: string) {
    const { reporteId, usuarioId } = comentario;
    return this.http.put<ComentarioDTO>(
      this.base + '/' + comentario.idComentario,
      { reporteId, usuarioId, textoComentario },
      { headers: this.acceso.obtenerCabeceras() },
    );
  }

  eliminar(id: number) {
    return this.http.delete<void>(this.base + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
}

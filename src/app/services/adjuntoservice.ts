import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdjuntoDTO } from '../models/AdjuntoDTO';
import { AdjuntoFormularioDTO } from '../models/AdjuntoFormularioDTO';
import { Accesoservice } from './accesoservice';
@Injectable({ providedIn: 'root' })
export class Adjuntoservice {
  private api = environment.base + '/api';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}
  listarPorReporte(idReporte: number): Observable<AdjuntoDTO[]> {
    return this.http.get<AdjuntoDTO[]>(this.api + '/attachments/reporte/' + idReporte, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(datos: AdjuntoFormularioDTO): Observable<AdjuntoDTO> {
    return this.http.post<AdjuntoDTO>(this.api + '/attachments', datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  actualizar(id: number, datos: AdjuntoFormularioDTO): Observable<AdjuntoDTO> {
    return this.http.put<AdjuntoDTO>(this.api + '/attachments/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/attachments/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Accesoservice } from './accesoservice';
import { RolDTO } from '../models/RolDTO';
import { RolFormularioDTO } from '../models/RolFormularioDTO';

@Injectable({ providedIn: 'root' })
export class Rolservice {
  private api = environment.base + '/api/roles';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}
  listar(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(this.api, { headers: this.acceso.obtenerCabeceras() });
  }
  obtener(id: number): Observable<RolDTO> {
    return this.http.get<RolDTO>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
  registrar(datos: RolFormularioDTO): Observable<RolDTO> {
    return this.http.post<RolDTO>(this.api, datos, { headers: this.acceso.obtenerCabeceras() });
  }
  actualizar(id: number, datos: RolFormularioDTO): Observable<RolDTO> {
    return this.http.put<RolDTO>(this.api + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
}

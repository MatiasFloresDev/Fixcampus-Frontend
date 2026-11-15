import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RolDTO } from '../models/RolDTO';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { UsuarioFormularioDTO } from '../models/UsuarioFormularioDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Usuarioservice {
  private readonly api = environment.base + '/api/users';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.api, { headers: this.acceso.obtenerCabeceras() });
  }

  roles(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(environment.base + '/api/roles', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(datos: UsuarioFormularioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.api, datos, { headers: this.acceso.obtenerCabeceras() });
  }

  actualizar(id: number, datos: UsuarioFormularioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(this.api + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
}

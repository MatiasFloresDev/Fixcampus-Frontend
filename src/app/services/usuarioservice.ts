import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RolUsuarioDTO, UsuarioDTO, UsuarioFormularioDTO } from '../models/UsuarioDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Usuarioservice {
  private readonly api = environment.base + '/api/users';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar() {
    return this.http.get<UsuarioDTO[]>(this.api, { headers: this.acceso.obtenerCabeceras() });
  }

  roles() {
    return this.http.get<RolUsuarioDTO[]>(environment.base + '/api/roles', {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(datos: UsuarioFormularioDTO) {
    return this.http.post<UsuarioDTO>(this.api, datos, { headers: this.acceso.obtenerCabeceras() });
  }

  actualizar(id: number, datos: UsuarioFormularioDTO) {
    return this.http.put<UsuarioDTO>(this.api + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(id: number) {
    return this.http.delete<void>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
}

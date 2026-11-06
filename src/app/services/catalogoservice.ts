import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DatosCatalogo, RegistroCatalogoDTO } from '../models/CatalogoDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Catalogoservice {
  private readonly base = environment.base + '/api/';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(recurso: string) {
    return this.http.get<RegistroCatalogoDTO[]>(this.base + recurso, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  obtener(recurso: string, id: number) {
    return this.http.get<RegistroCatalogoDTO>(this.base + recurso + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(recurso: string, datos: DatosCatalogo) {
    return this.http.post<RegistroCatalogoDTO>(this.base + recurso, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  actualizar(recurso: string, id: number, datos: DatosCatalogo) {
    return this.http.put<RegistroCatalogoDTO>(this.base + recurso + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(recurso: string, id: number) {
    return this.http.delete<void>(this.base + recurso + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
}

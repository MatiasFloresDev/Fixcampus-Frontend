import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriaDTO } from '../models/CategoriaDTO';
import { CategoriaFormularioDTO } from '../models/CategoriaFormularioDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Categoriaservice {
  private api = environment.base + '/api/categories';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}
  listar(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.api, { headers: this.acceso.obtenerCabeceras() });
  }
  obtener(id: number): Observable<CategoriaDTO> {
    return this.http.get<CategoriaDTO>(this.api + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  registrar(datos: CategoriaFormularioDTO): Observable<CategoriaDTO> {
    return this.http.post<CategoriaDTO>(this.api, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  actualizar(id: number, datos: CategoriaFormularioDTO): Observable<CategoriaDTO> {
    return this.http.put<CategoriaDTO>(this.api + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
  buscarDescripcion(palabraClave: string): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.api + '/buscar-descripcion', {
      headers: this.acceso.obtenerCabeceras(),
      params: { palabraClave },
    });
  }
}

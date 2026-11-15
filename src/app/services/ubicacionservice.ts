import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Accesoservice } from './accesoservice';
import { UbicacionDTO } from '../models/UbicacionDTO';
import { UbicacionFormularioDTO } from '../models/UbicacionFormularioDTO';

@Injectable({ providedIn: 'root' })
export class Ubicacionservice {
  private api = environment.base + '/api/locations';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}
  listar(): Observable<UbicacionDTO[]> {
    return this.http.get<UbicacionDTO[]>(this.api, { headers: this.acceso.obtenerCabeceras() });
  }
  obtener(id: number): Observable<UbicacionDTO> {
    return this.http.get<UbicacionDTO>(this.api + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  registrar(datos: UbicacionFormularioDTO): Observable<UbicacionDTO> {
    return this.http.post<UbicacionDTO>(this.api, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  actualizar(id: number, datos: UbicacionFormularioDTO): Observable<UbicacionDTO> {
    return this.http.put<UbicacionDTO>(this.api + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/' + id, { headers: this.acceso.obtenerCabeceras() });
  }
}

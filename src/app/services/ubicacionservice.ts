import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UbicacionDTO } from '../models/UbicacionDTO';
import { Accesoservice } from './accesoservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Ubicacionservice {
  private apiURL = environment.base + '/api/locations';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(): Observable<UbicacionDTO[]> {
    return this.http.get<UbicacionDTO[]>(this.apiURL, { headers: this.acceso.obtenerCabeceras() });
  }
}

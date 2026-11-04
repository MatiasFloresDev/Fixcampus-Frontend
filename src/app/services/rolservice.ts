import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolDTO } from '../models/RolDTO';
import { Accesoservice } from './accesoservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Rolservice {
  private apiURL = environment.base + '/api/roles';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(this.apiURL, { headers: this.acceso.obtenerCabeceras() });
  }
}

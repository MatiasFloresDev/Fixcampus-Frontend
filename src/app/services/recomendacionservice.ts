import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RecomendacionDTO } from '../models/RecomendacionDTO';
import { Accesoservice } from './accesoservice';

@Injectable({ providedIn: 'root' })
export class Recomendacionservice {
  private readonly base = environment.base + '/api/recomendaciones';

  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(prioridad: string) {
    const headers = this.acceso.obtenerCabeceras();
    return prioridad
      ? this.http.get<RecomendacionDTO[]>(this.base + '/prioridad', {
          headers,
          params: { prioridad },
        })
      : this.http.get<RecomendacionDTO[]>(this.base, { headers });
  }
}

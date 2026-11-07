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

  porReporte(reporteId: number) {
    return this.http.get<RecomendacionDTO | null>(this.base + '/reporte/' + reporteId, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  registrar(datos: Omit<RecomendacionDTO, 'idRecomendacion' | 'fechaRecomendacion'>) {
    return this.http.post<RecomendacionDTO>(this.base, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  actualizar(id: number, datos: Omit<RecomendacionDTO, 'idRecomendacion' | 'fechaRecomendacion'>) {
    return this.http.put<RecomendacionDTO>(this.base + '/' + id, datos, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

  eliminar(id: number) {
    return this.http.delete<void>(this.base + '/' + id, {
      headers: this.acceso.obtenerCabeceras(),
    });
  }

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

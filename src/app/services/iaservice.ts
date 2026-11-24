import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SugerenciaCategoriaDTO } from '../models/SugerenciaCategoriaDTO';
import { SugerenciaRecomendacionDTO } from '../models/SugerenciaRecomendacionDTO';

@Injectable({ providedIn: 'root' })
export class Iaservice {
  constructor(private http: HttpClient) {}
  sugerirCategoria(descripcion: string): Observable<SugerenciaCategoriaDTO> {
    return this.http.post<SugerenciaCategoriaDTO>(
      environment.base + '/api/reports/sugerir-categoria',
      { descripcion },
    );
  }
  sugerirRecomendacion(reporteId: number): Observable<SugerenciaRecomendacionDTO> {
    return this.http.post<SugerenciaRecomendacionDTO>(
      environment.base + '/api/recomendaciones/sugerir/' + reporteId,
      {},
    );
  }
}

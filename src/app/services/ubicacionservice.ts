import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UbicacionDTOInsert } from '../models/UbicacionDTOInsert';
import { UbicacionDTOList } from '../models/UbicacionDTOList';

@Injectable({ providedIn: 'root' })
export class Ubicacionservice {
  private apiURL = environment.base + '/api/locations';
  constructor(private http: HttpClient) {}

  listar(): Observable<UbicacionDTOList[]> {
    return this.http.get<UbicacionDTOList[]>(this.apiURL);
  }
  buscarPorId(id: number): Observable<UbicacionDTOList> {
    return this.http.get<UbicacionDTOList>(this.apiURL + '/' + id);
  }
  registrar(dto: UbicacionDTOInsert): Observable<UbicacionDTOList> {
    return this.http.post<UbicacionDTOList>(this.apiURL, dto);
  }
  actualizar(id: number, dto: UbicacionDTOInsert): Observable<UbicacionDTOList> {
    return this.http.put<UbicacionDTOList>(this.apiURL + '/' + id, dto);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
}

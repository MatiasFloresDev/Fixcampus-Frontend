import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RolDTOInsert } from '../models/RolDTOInsert';
import { RolDTOList } from '../models/RolDTOList';

@Injectable({ providedIn: 'root' })
export class Rolservice {
  private apiURL = environment.base + '/api/roles';
  constructor(private http: HttpClient) {}

  listar(): Observable<RolDTOList[]> {
    return this.http.get<RolDTOList[]>(this.apiURL);
  }
  buscarPorId(id: number): Observable<RolDTOList> {
    return this.http.get<RolDTOList>(this.apiURL + '/' + id);
  }
  registrar(dto: RolDTOInsert): Observable<RolDTOList> {
    return this.http.post<RolDTOList>(this.apiURL, dto);
  }
  actualizar(id: number, dto: RolDTOInsert): Observable<RolDTOList> {
    return this.http.put<RolDTOList>(this.apiURL + '/' + id, dto);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
}

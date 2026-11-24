import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriaDTOInsert } from '../models/CategoriaDTOInsert';
import { CategoriaDTOList } from '../models/CategoriaDTOList';

@Injectable({ providedIn: 'root' })
export class Categoriaservice {
  private apiURL = environment.base + '/api/categories';
  constructor(private http: HttpClient) {}

  listar(): Observable<CategoriaDTOList[]> {
    return this.http.get<CategoriaDTOList[]>(this.apiURL);
  }
  buscarPorId(id: number): Observable<CategoriaDTOList> {
    return this.http.get<CategoriaDTOList>(this.apiURL + '/' + id);
  }
  registrar(dto: CategoriaDTOInsert): Observable<CategoriaDTOList> {
    return this.http.post<CategoriaDTOList>(this.apiURL, dto);
  }
  actualizar(id: number, dto: CategoriaDTOInsert): Observable<CategoriaDTOList> {
    return this.http.put<CategoriaDTOList>(this.apiURL + '/' + id, dto);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
}

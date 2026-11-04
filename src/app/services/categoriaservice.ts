import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaDTO } from '../models/CategoriaDTO';
import { Accesoservice } from './accesoservice';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Categoriaservice {
  private apiURL = environment.base + '/api/categories';
  constructor(
    private http: HttpClient,
    private acceso: Accesoservice,
  ) {}

  listar(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.apiURL, { headers: this.acceso.obtenerCabeceras() });
  }
}

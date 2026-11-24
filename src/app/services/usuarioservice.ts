import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioDTOList } from '../models/UsuarioDTOList';
import { UsuarioDTOInsert } from '../models/UsuarioDTOInsert';
import { UsuarioDTOUpdate } from '../models/UsuarioDTOUpdate';
import { UsuariosPorRolDTO } from '../models/UsuariosPorRolDTO';

@Injectable({ providedIn: 'root' })
export class Usuarioservice {
  private apiURL = environment.base + '/api/users';

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioDTOList[]> {
    return this.http.get<UsuarioDTOList[]>(this.apiURL);
  }

  buscarPorId(id: number): Observable<UsuarioDTOList> {
    return this.http.get<UsuarioDTOList>(this.apiURL + '/' + id);
  }

  registrar(dto: UsuarioDTOInsert): Observable<UsuarioDTOList> {
    return this.http.post<UsuarioDTOList>(environment.base + '/registro', dto);
  }

  actualizar(id: number, dto: UsuarioDTOUpdate): Observable<UsuarioDTOList> {
    return this.http.put<UsuarioDTOList>(this.apiURL + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.apiURL + '/' + id);
  }
  
  usuariosPorRol(): Observable<UsuariosPorRolDTO[]> {
    return this.http.get<UsuariosPorRolDTO[]>(this.apiURL + '/estadisticas/por-rol');
  }

  buscarPorNombre(nombre: string): Observable<UsuarioDTOList[]> {
    return this.http.get<UsuarioDTOList[]>(this.apiURL + '/buscar-nombre', {
      params: { nombre },
    });
  }
}

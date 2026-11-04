import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  correo: string;
  idUsuario: number;
}

@Injectable({ providedIn: 'root' })
export class Accesoservice {
  private token = '';
  constructor(private http: HttpClient) {}

  ingresar(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.base + '/login', { correo, password });
  }

  guardarToken(token: string): void {
    this.token = token;
  }
  tieneSesion(): boolean {
    return this.token.length > 0;
  }
  salir(): void {
    this.token = '';
  }
  obtenerCabeceras(): HttpHeaders {
    return this.token
      ? new HttpHeaders({ Authorization: 'Bearer ' + this.token })
      : new HttpHeaders();
  }
}

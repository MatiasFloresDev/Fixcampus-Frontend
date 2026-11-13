import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDTO, RegistroDTO } from '../models/AccesoDTO';

@Injectable({ providedIn: 'root' })
export class Accesoservice {
  private token = '';
  private vence = 0;
  private temporizador?: ReturnType<typeof setTimeout>;
  private navegador: boolean;
  private clave = 'fixcampus-token';
  private rolActual = '';
  private sesionVencida = false;

  rol(): string {
    return this.rolActual;
  }

  vencida(): boolean {
    return this.sesionVencida;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) plataforma: object,
  ) {
    this.navegador = isPlatformBrowser(plataforma);
    if (this.navegador) {
      const guardado = sessionStorage.getItem(this.clave);
      if (guardado && !this.guardarToken(guardado)) {
        this.salir();
        this.sesionVencida = true;
      }
    }
  }

  registrar(datos: RegistroDTO): Observable<unknown> {
    return this.http.post(environment.base + '/registro', datos);
  }

  ingresar(correo: string, password: string): Observable<LoginDTO> {
    return this.http.post<LoginDTO>(environment.base + '/login', { correo, password });
  }

  guardarToken(token: string): boolean {
    try {
      const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const datos: { exp: number; roles: string } = JSON.parse(atob(parte));
      const roles = datos.roles.split(',').map((rol) => rol.trim().replace(/^ROLE_/, ''));
      const rol = roles.includes('ADMIN') ? 'ADMIN' : roles.includes('USUARIO') ? 'USUARIO' : '';
      const tiempo = datos.exp * 1000 - Date.now();
      if (!rol || !Number.isFinite(tiempo) || tiempo <= 0) return false;
      clearTimeout(this.temporizador);
      this.token = token;
      this.vence = datos.exp * 1000;
      this.rolActual = rol;
      this.sesionVencida = false;
      if (this.navegador) {
        sessionStorage.setItem(this.clave, token);
        this.temporizador = setTimeout(() => this.vencer(), tiempo);
      }
      return true;
    } catch {
      return false;
    }
  }

  tieneSesion(): boolean {
    return this.token !== '' && this.vence > Date.now();
  }

  obtenerCabeceras(): HttpHeaders {
    return this.tieneSesion()
      ? new HttpHeaders({ Authorization: 'Bearer ' + this.token })
      : new HttpHeaders();
  }

  salir(): void {
    clearTimeout(this.temporizador);
    this.token = '';
    this.vence = 0;
    this.rolActual = '';
    this.sesionVencida = false;
    if (this.navegador) sessionStorage.removeItem(this.clave);
  }

  revisarError(error: HttpErrorResponse): void {
    if (error.status === 401 && this.token) this.vencer();
  }

  private vencer(): void {
    this.salir();
    this.sesionVencida = true;
    this.router.navigate(['/acceso']);
  }
}

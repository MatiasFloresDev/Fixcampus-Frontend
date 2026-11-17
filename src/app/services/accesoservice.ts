import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDTO } from '../models/LoginDTO';
import { RegistroDTO } from '../models/RegistroDTO';

@Injectable({ providedIn: 'root' })
export class Accesoservice {
  private token = '';
  private vence = 0;
  private temporizador?: number;
  private navegador = typeof window !== 'undefined';
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
  ) {
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
      let rol = '';
      for (const nombre of datos.roles.split(',')) {
        const actual = nombre.trim().replace(/^ROLE_/, '');
        if (actual === 'ADMIN') {
          rol = 'ADMIN';
          break;
        }
        if (actual === 'USUARIO') rol = 'USUARIO';
      }
      const tiempo = datos.exp * 1000 - Date.now();
      if (!rol || !Number.isFinite(tiempo) || tiempo <= 0) return false;
      clearTimeout(this.temporizador);
      this.token = token;
      this.vence = datos.exp * 1000;
      this.rolActual = rol;
      this.sesionVencida = false;
      if (this.navegador) {
        sessionStorage.setItem(this.clave, token);
        this.temporizador = window.setTimeout(() => this.vencer(), tiempo);
      }
      return true;
    } catch {
      return false;
    }
  }

  tieneSesion(): boolean {
    return this.token !== '' && this.vence > Date.now();
  }

  validarSesion(administrador = false): boolean {
    if (!this.tieneSesion()) {
      if (this.token) this.vencer();
      else this.router.navigate(['/acceso']);
      return false;
    }
    if (administrador && this.rolActual !== 'ADMIN') {
      this.router.navigate(['/panel']);
      return false;
    }
    return true;
  }

  irAlPanelSiTieneSesion(): void {
    if (this.tieneSesion()) this.router.navigate(['/panel']);
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

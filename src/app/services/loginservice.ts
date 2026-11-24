import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/LoginRequestDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';
import { DatosTokenDTO } from '../models/DatosTokenDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private apiURL = `${environment.base}/login`;
  private isBrowser: boolean;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) plataforma: object,
  ) {
    this.isBrowser = isPlatformBrowser(plataforma);
  }

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, credentials).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('La respuesta de login no contiene un token.');
        }

        const roles = this.extractRolesFromToken(response.token);
        const username = response.correo || this.extractSubjectFromToken(response.token);

        if (this.isBrowser) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('roles', JSON.stringify(roles));
        }
      }),
    );
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;

    const token = sessionStorage.getItem('token');
    if (!token) return null;

    if (this.isExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getUsername(): string {
    if (!this.isBrowser || !this.isAuthenticated()) return '';
    return sessionStorage.getItem('username') ?? '';
  }

  getRoles(): string[] {
    if (!this.isBrowser || !this.isAuthenticated()) return [];

    const value = sessionStorage.getItem('roles');
    if (!value) return [];

    try {
      const roles: unknown = JSON.parse(value);
      if (Array.isArray(roles) && roles.every((r) => typeof r === 'string')) {
        return roles;
      }
    } catch {
      sessionStorage.removeItem('roles');
    }

    return [];
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    for (const role of this.getRoles()) {
      const actual = this.normalizarRol(role);
      for (const permitido of allowedRoles) {
        if (typeof permitido === 'string' && actual === this.normalizarRol(permitido)) {
          return true;
        }
      }
    }
    return false;
  }

  private normalizarRol(role: string): string {
    const nombre = role.trim().toUpperCase();
    return nombre.startsWith('ROLE_') ? nombre.slice(5) : nombre;
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('roles');
    }
  }

  private isExpired(token: string): boolean {
    try {
      const datos = this.jwtHelper.decodeToken<DatosTokenDTO>(token);
      return (
        !datos ||
        typeof datos.exp !== 'number' ||
        !Number.isFinite(datos.exp) ||
        datos.exp * 1000 <= Date.now()
      );
    } catch {
      return true;
    }
  }

  private extractRolesFromToken(token: string): string[] {
    try {
      const decoded = this.jwtHelper.decodeToken<DatosTokenDTO>(token);
      const rolesClaim = decoded?.roles;

      if (typeof rolesClaim === 'string') {
        return rolesClaim
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
      }
      if (Array.isArray(rolesClaim)) {
        return rolesClaim.filter((r): r is string => typeof r === 'string');
      }
      return [];
    } catch {
      return [];
    }
  }

  private extractSubjectFromToken(token: string): string {
    try {
      const decoded = this.jwtHelper.decodeToken<DatosTokenDTO>(token);
      return typeof decoded?.sub === 'string' ? decoded.sub : '';
    } catch {
      return '';
    }
  }
}

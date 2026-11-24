import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/LoginRequestDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly apiURL = `${environment.base}/login`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly jwtHelper = new JwtHelperService();

  // Señal reactiva para forzar actualización inmediata de la UI (ej. Menucomponent)
  readonly sessionVersion = signal(0);

  constructor(private readonly http: HttpClient) {}

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

        this.sessionVersion.update((v) => v + 1);
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
    this.sessionVersion(); // registra dependencia reactiva en templates/computed
    return this.getToken() !== null;
  }

  getUsername(): string {
    this.sessionVersion();
    if (!this.isBrowser || !this.isAuthenticated()) return '';
    return sessionStorage.getItem('username') ?? '';
  }

  getRoles(): string[] {
    this.sessionVersion();
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

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const normalize = (role: string) =>
      role.startsWith('ROLE_') ? role.slice('ROLE_'.length).toUpperCase() : role.toUpperCase();

    const allowed = new Set(allowedRoles.map(normalize));
    return this.getRoles().some((role) => allowed.has(normalize(role)));
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('roles');
    }
    this.sessionVersion.update((v) => v + 1);
  }

  private isExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch {
      return true;
    }
  }

  private extractRolesFromToken(token: string): string[] {
    try {
      const decoded = this.jwtHelper.decodeToken<Record<string, unknown>>(token);
      const rolesClaim = decoded?.['roles'];

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
      const decoded = this.jwtHelper.decodeToken<Record<string, unknown>>(token);
      return typeof decoded?.['sub'] === 'string' ? decoded['sub'] : '';
    } catch {
      return '';
    }
  }
}
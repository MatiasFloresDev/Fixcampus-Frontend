import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Accesoservice } from '../../services/accesoservice';

interface UsuarioListado {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rolId: number;
  estado: string;
  fechaRegistro: string;
}

@Component({
  imports: [DatePipe, MatButtonModule],
  template: `
    <section class="contenedor">
      <div class="encabezado">
        <div>
          <h1>Usuarios</h1>
          <p>Consulta las cuentas y sus roles.</p>
        </div>
      </div>
      @if (cargando()) {
        <p role="status">Cargando usuarios…</p>
      } @else if (error()) {
        <p role="alert" class="aviso error">No se pudo consultar a los usuarios.</p>
        <button mat-stroked-button type="button" (click)="cargar()">Volver a intentar</button>
      } @else if (usuarios().length === 0) {
        <p class="aviso">Todavía no hay usuarios.</p>
      } @else {
        <div class="tabla tarjeta">
          <table>
            <caption>
              Usuarios registrados
            </caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col">Registro</th>
              </tr>
            </thead>
            <tbody>
              @for (item of usuarios(); track item.idUsuario) {
                <tr>
                  <td>{{ item.nombre }} {{ item.apellido }}</td>
                  <td>{{ item.correo }}</td>
                  <td>{{ roles()[item.rolId] || 'Rol #' + item.rolId }}</td>
                  <td>{{ item.estado }}</td>
                  <td>{{ item.fechaRegistro | date: 'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    .tabla {
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    caption {
      text-align: left;
      font-weight: 700;
      padding: 8px;
    }
    th,
    td {
      text-align: left;
      padding: 8px;
      border-block-end: 1px solid #d6dbe0;
    }
  `,
})
export class Usuarioscomponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly acceso = inject(Accesoservice);
  protected readonly usuarios = signal<UsuarioListado[]>([]);
  protected readonly roles = signal<Record<number, string>>({});
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    const headers = this.acceso.obtenerCabeceras();
    this.cargando.set(true);
    this.error.set(false);
    forkJoin({
      usuarios: this.http.get<UsuarioListado[]>(environment.base + '/api/users', { headers }),
      roles: this.http.get<{ idRol: number; nombre: string }[]>(environment.base + '/api/roles', {
        headers,
      }),
    }).subscribe({
      next: ({ usuarios, roles }) => {
        this.usuarios.set(usuarios);
        this.roles.set(Object.fromEntries(roles.map((rol) => [rol.idRol, rol.nombre])));
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}

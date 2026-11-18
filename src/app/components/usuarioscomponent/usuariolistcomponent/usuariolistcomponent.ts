import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Usuarioservice } from '../../../services/usuarioservice';

import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-usuariolistcomponent',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './usuariolistcomponent.html',
  styleUrl: './usuariolistcomponent.css',
})
export class Usuariolistcomponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  roles: RolDTO[] = [];
  cargando = false;
  ocupado = false;
  error = '';
  busqueda = '';
  pagina = 0;
  porPagina = 5;
  pendiente: UsuarioDTO | null = null;
  constructor(
    private servicio: Usuarioservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargar();
  }
  filtrados() {
    const texto = this.busqueda.trim().toLocaleLowerCase('es');
    return this.usuarios.filter((u) =>
      (u.nombre + ' ' + u.apellido + ' ' + u.correo).toLocaleLowerCase('es').includes(texto),
    );
  }
  filas() {
    return this.filtrados().slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }
  totales() {
    return this.roles.map((rol) => ({
      nombre: rol.nombre,
      cantidad: this.usuarios.filter((u) => u.rolId === rol.idRol).length,
    }));
  }
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.servicio.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargarRoles();
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }
  nombreRol(id: number): string {
    return this.roles.find((rol) => rol.idRol === id)?.nombre ?? 'Rol no disponible';
  }
  buscar(texto: string): void {
    this.busqueda = texto;
    this.pagina = 0;
  }
  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }
  eliminar(): void {
    const usuario = this.pendiente;
    if (!usuario || this.ocupado) return;
    this.ocupado = true;
    this.servicio.eliminar(usuario.idUsuario).subscribe({
      next: () => {
        this.finalizar('Se eliminó la cuenta.');
        this.ocupado = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mostrarError(error);
        this.ocupado = false;
        this.cdr.detectChanges();
      },
    });
  }
  private finalizar(mensaje: string): void {
    this.cerrar();
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cargar();
  }
  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error =
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : 'No se pudo completar la consulta. Vuelve a intentarlo.';
  }
  private cargarRoles(): void {
    this.servicio.roles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.pagina = Math.min(
          this.pagina,
          Math.max(0, Math.ceil(this.filtrados().length / this.porPagina) - 1),
        );
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }
  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error);
    this.cargando = false;
    this.cdr.detectChanges();
  }
  cerrar(): void {
    this.pendiente = null;
    this.error = '';
  }
}

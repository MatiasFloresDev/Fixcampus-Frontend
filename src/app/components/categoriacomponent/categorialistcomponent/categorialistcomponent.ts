import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { CategoriaDTO } from '../../../models/CategoriaDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Categoriaservice } from '../../../services/categoriaservice';

import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-categorialistcomponent',
  imports: [MatButtonModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, RouterLink],
  templateUrl: './categorialistcomponent.html',
  styleUrl: './categorialistcomponent.css',
})
export class Categorialistcomponent implements OnInit {
  columnas: string[] = ['idCategoria', 'nombre', 'descripcion', 'acciones'];
  registros: CategoriaDTO[] = [];
  cargando = false;
  ocupado = false;
  errorLista = '';
  errorAccion = '';
  pendiente = 0;
  pagina = 0;
  porPagina = 5;

  constructor(
    private servicio: Categoriaservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargar();
  }
  filas() {
    return this.registros.slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }
  cargar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.registros = datos;
        this.pagina = Math.min(
          this.pagina,
          Math.max(0, Math.ceil(datos.length / this.porPagina) - 1),
        );
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.errorLista = this.mensajeError(error, 'No se pudo cargar el listado.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }
  pedirEliminar(registro: CategoriaDTO): void {
    this.cerrar();
    this.pendiente = registro.idCategoria;
  }
  eliminar(): void {
    if (!this.pendiente || this.ocupado) return;
    this.ocupado = true;
    this.errorAccion = '';
    this.servicio.eliminar(this.pendiente).subscribe({
      next: () => {
        this.finalizar('Se eliminó el registro.');
      },
      error: (error: HttpErrorResponse) => {
        this.fallar(error, 'No se pudo eliminar el registro.');
      },
    });
  }
  private finalizar(mensaje: string): void {
    this.cerrar();
    this.ocupado = false;
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cargar();
    this.cdr.detectChanges();
  }
  private fallar(error: HttpErrorResponse, mensaje: string): void {
    this.errorAccion = this.mensajeError(error, mensaje);
    this.ocupado = false;
    this.cdr.detectChanges();
  }
  private mensajeError(error: HttpErrorResponse, respaldo: string): string {
    this.acceso.revisarError(error);
    if (error.status === 403) return 'Esta acción requiere una cuenta administradora.';
    if ([400, 404, 409].includes(error.status) && typeof error.error?.message === 'string')
      return error.error.message;
    return respaldo;
  }
  cerrar(): void {
    this.pendiente = 0;
    this.errorAccion = '';
  }
}

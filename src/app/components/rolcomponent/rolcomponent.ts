import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Accesoservice } from '../../services/accesoservice';
import { RolDTO } from '../../models/RolDTO';
import { RolFormularioDTO } from '../../models/RolFormularioDTO';
import { Rolservice } from '../../services/rolservice';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './rolcomponent.html',
  styleUrl: './rolcomponent.css',
})
export class Rolcomponent implements OnInit {
  columnas: string[] = ['idRol', 'nombre', 'nivelAcceso', 'descripcion', 'acciones'];
  registros: RolDTO[] = [];
  formulario: FormGroup;
  cargando = false;
  ocupado = false;
  errorLista = '';
  errorAccion = '';
  modo = '';
  idEditado = 0;
  pendiente = 0;
  pagina = 0;
  porPagina = 5;

  constructor(
    private servicio: Rolservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      nivelAcceso: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
    });
  }
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
  nuevo(): void {
    this.cerrar();
    this.formulario.enable();
    this.modo = 'nuevo';
  }
  abrir(registro: RolDTO, modo: string): void {
    if (this.ocupado) return;
    this.cerrar();
    this.ocupado = true;
    this.servicio.obtener(registro.idRol).subscribe({
      next: (datos) => {
        this.formulario.reset({
          nombre: datos.nombre,
          nivelAcceso: datos.nivelAcceso,
          descripcion: datos.descripcion ?? '',
        });
        this.idEditado = datos.idRol;
        this.formulario.enable();
        if (modo === 'detalle') this.formulario.disable();
        else if (this.rolBase(datos)) this.formulario.controls['nombre'].disable();
        this.modo = modo;
        this.ocupado = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.fallar(error, 'No se pudo abrir el registro.');
      },
    });
  }
  cerrar(): void {
    this.modo = '';
    this.idEditado = 0;
    this.pendiente = 0;
    this.errorAccion = '';
    this.formulario.reset({
      nombre: '',
      nivelAcceso: '',
      descripcion: '',
    });
  }
  guardar(): void {
    if (this.ocupado || this.modo === 'detalle' || !this.modo) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = new RolFormularioDTO();
    datos.nombre = valores.nombre.trim();
    datos.nivelAcceso = valores.nivelAcceso.trim();
    datos.descripcion = valores.descripcion.trim() || null;
    this.errorAccion = '';
    this.ocupado = true;
    const peticion = this.idEditado
      ? this.servicio.actualizar(this.idEditado, datos)
      : this.servicio.registrar(datos);
    peticion.subscribe({
      next: () => {
        this.finalizar('Se guardó el registro.');
      },
      error: (error: HttpErrorResponse) => {
        this.fallar(error, 'No se pudo guardar el registro.');
      },
    });
  }
  pedirEliminar(registro: RolDTO): void {
    this.cerrar();
    this.pendiente = registro.idRol;
  }
  rolBase(registro: RolDTO): boolean {
    return registro.nombre === 'ADMIN' || registro.nombre === 'USUARIO';
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
}

import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Accesoservice } from '../../services/accesoservice';
import { CategoriaDTO } from '../../models/CategoriaDTO';
import { CategoriaFormularioDTO } from '../../models/CategoriaFormularioDTO';
import { Categoriaservice } from '../../services/categoriaservice';

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
  templateUrl: './categoriacomponent.html',
  styleUrl: './categoriacomponent.css',
})
export class Categoriacomponent implements OnInit, OnDestroy {
  columnas: string[] = ['idCategoria', 'nombre', 'descripcion', 'acciones'];
  registros: CategoriaDTO[] = [];
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
  private suscripciones = new Subscription();

  constructor(
    private servicio: Categoriaservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    });
  }
  ngOnInit(): void {
    this.cargar();
  }
  get filas() {
    return this.registros.slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }
  cargar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.suscripciones.add(
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
      }),
    );
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
  abrir(registro: CategoriaDTO, modo: string): void {
    if (this.ocupado) return;
    this.cerrar();
    this.ocupado = true;
    this.suscripciones.add(
      this.servicio.obtener(registro.idCategoria).subscribe({
        next: (datos) => {
          this.formulario.reset({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
          });
          this.idEditado = datos.idCategoria;
          this.formulario.enable();
          if (modo === 'detalle') this.formulario.disable();
          this.modo = modo;
          this.ocupado = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.fallar(error, 'No se pudo abrir el registro.'),
      }),
    );
  }
  cerrar(): void {
    this.modo = '';
    this.idEditado = 0;
    this.pendiente = 0;
    this.errorAccion = '';
    this.formulario.reset({
      nombre: '',
      descripcion: '',
    });
  }
  guardar(): void {
    if (this.ocupado || this.modo === 'detalle' || !this.modo) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = new CategoriaFormularioDTO();
    datos.nombre = valores.nombre.trim();
    datos.descripcion = valores.descripcion.trim();
    this.errorAccion = '';
    this.ocupado = true;
    const peticion = this.idEditado
      ? this.servicio.actualizar(this.idEditado, datos)
      : this.servicio.registrar(datos);
    this.suscripciones.add(
      peticion.subscribe({
        next: () => this.finalizar('Se guardó el registro.'),
        error: (error: HttpErrorResponse) => this.fallar(error, 'No se pudo guardar el registro.'),
      }),
    );
  }
  pedirEliminar(registro: CategoriaDTO): void {
    this.cerrar();
    this.pendiente = registro.idCategoria;
  }
  eliminar(): void {
    if (!this.pendiente || this.ocupado) return;
    this.ocupado = true;
    this.errorAccion = '';
    this.suscripciones.add(
      this.servicio.eliminar(this.pendiente).subscribe({
        next: () => this.finalizar('Se eliminó el registro.'),
        error: (error: HttpErrorResponse) => this.fallar(error, 'No se pudo eliminar el registro.'),
      }),
    );
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
  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

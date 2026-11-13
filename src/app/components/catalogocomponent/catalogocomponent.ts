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
import { ActivatedRoute } from '@angular/router';
import { CampoCatalogo, DefinicionCatalogo, RegistroCatalogoDTO } from '../../models/CatalogoDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Catalogoservice } from '../../services/catalogoservice';

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
  templateUrl: './catalogocomponent.html',
  styleUrl: './catalogocomponent.css',
})
export class Catalogocomponent implements OnInit, OnDestroy {
  protected readonly catalogo: DefinicionCatalogo;
  protected readonly columnas: string[];
  protected formulario: FormGroup = new FormGroup({});
  protected registros: RegistroCatalogoDTO[] = [];
  protected cargando = false;
  protected ocupado = false;
  protected errorLista = '';
  protected errorAccion = '';
  protected modo: 'nuevo' | 'editar' | 'detalle' | null = null;
  protected idEditado: number | null = null;
  protected pendiente: number | null = null;
  protected pagina = 0;
  protected porPagina = 5;
  private suscripciones = new Subscription();

  constructor(
    private servicio: Catalogoservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.catalogo = this.ruta.snapshot.data['catalogo'];
    this.columnas = ['id', ...this.catalogo.columnas, 'acciones'];
  }

  ngOnInit(): void {
    if (this.catalogo.id === 'idCategoria') {
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
        descripcion: [
          '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)],
        ],
      });
    } else if (this.catalogo.id === 'idUbicacion') {
      this.formulario = this.fb.group({
        campus: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
        edificio: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
        piso: [
          null,
          [Validators.min(-2147483648), Validators.max(2147483647), Validators.pattern(/^-?\d+$/)],
        ],
        zona: ['', Validators.maxLength(150)],
        tipo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
        latitud: [null, [Validators.min(-90), Validators.max(90)]],
        longitud: [null, [Validators.min(-180), Validators.max(180)]],
      });
    } else {
      this.formulario = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
        nivelAcceso: [
          '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)],
        ],
        descripcion: ['', Validators.maxLength(255)],
      });
    }
    this.cargar();
  }

  protected get filas() {
    const inicio = this.pagina * this.porPagina;
    return this.registros.slice(inicio, inicio + this.porPagina);
  }

  protected cargar(): void {
    this.errorLista = '';
    this.cargando = true;
    this.suscripciones.add(
      this.servicio.listar(this.catalogo.recurso).subscribe({
        next: (datos) => {
          this.registros = datos;
          this.pagina = Math.min(
            this.pagina,
            Math.max(0, Math.ceil(datos.length / this.porPagina) - 1),
          );
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorLista = this.mensajeError(error, 'No se pudo cargar el catálogo.');
          this.cargando = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }

  protected etiqueta(clave: CampoCatalogo): string {
    return this.catalogo.campos.find((campo) => campo.clave === clave)?.etiqueta ?? clave;
  }

  protected rolBase(registro: RegistroCatalogoDTO): boolean {
    return (
      this.catalogo.id === 'idRol' && (registro.nombre === 'ADMIN' || registro.nombre === 'USUARIO')
    );
  }

  protected nuevo(): void {
    this.cerrar();
    this.formulario.enable();
    this.modo = 'nuevo';
  }

  protected abrir(registro: RegistroCatalogoDTO, modo: 'editar' | 'detalle'): void {
    const id = registro[this.catalogo.id];
    if (id === undefined || this.ocupado) return;
    this.cerrar();
    this.ocupado = true;
    this.suscripciones.add(
      this.servicio.obtener(this.catalogo.recurso, id).subscribe({
        next: (datos) => {
          for (const campo of this.catalogo.campos) {
            this.formulario.controls[campo.clave].reset(datos[campo.clave] ?? null);
          }
          this.idEditado = id;
          this.formulario.enable();
          if (modo === 'detalle') this.formulario.disable();
          else if (this.rolBase(datos)) this.formulario.controls['nombre'].disable();
          this.modo = modo;
          this.ocupado = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorAccion = this.mensajeError(error, 'No se pudo abrir el registro.');
          this.ocupado = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  protected cerrar(): void {
    this.modo = null;
    this.idEditado = null;
    this.pendiente = null;
    this.formulario.reset();
    this.errorAccion = '';
  }

  protected guardar(): void {
    if (this.ocupado || this.modo === 'detalle' || !this.modo) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const datos = this.formulario.getRawValue();
    for (const campo of this.catalogo.campos) {
      const valor = datos[campo.clave];
      if (typeof valor === 'string') datos[campo.clave] = valor.trim() || null;
    }
    if ((datos['latitud'] == null) !== (datos['longitud'] == null)) {
      this.errorAccion = 'Ingresa latitud y longitud juntas.';
      return;
    }
    this.errorAccion = '';
    this.ocupado = true;
    const id = this.idEditado;
    const peticion =
      id === null
        ? this.servicio.registrar(this.catalogo.recurso, datos)
        : this.servicio.actualizar(this.catalogo.recurso, id, datos);
    this.suscripciones.add(
      peticion.subscribe({
        next: () => {
          this.finalizar('Se guardó el registro.');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.fallar(error, 'No se pudo guardar el registro.');
          this.cdr.detectChanges();
        },
      }),
    );
  }

  protected pedirEliminar(registro: RegistroCatalogoDTO): void {
    this.cerrar();
    this.pendiente = registro[this.catalogo.id] ?? null;
  }

  protected eliminar(): void {
    const id = this.pendiente;
    if (id === null || this.ocupado) return;
    this.ocupado = true;
    this.errorAccion = '';
    this.suscripciones.add(
      this.servicio.eliminar(this.catalogo.recurso, id).subscribe({
        next: () => {
          this.finalizar('Se eliminó el registro.');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.fallar(error, 'No se pudo eliminar el registro.');
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private finalizar(mensaje: string): void {
    this.cerrar();
    this.ocupado = false;
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cargar();
  }

  private fallar(error: HttpErrorResponse, mensaje: string): void {
    this.errorAccion = this.mensajeError(error, mensaje);
    this.ocupado = false;
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

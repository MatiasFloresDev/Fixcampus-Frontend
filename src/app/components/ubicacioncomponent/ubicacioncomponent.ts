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
import { UbicacionDTO } from '../../models/UbicacionDTO';
import { UbicacionFormularioDTO } from '../../models/UbicacionFormularioDTO';
import { Ubicacionservice } from '../../services/ubicacionservice';

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
  templateUrl: './ubicacioncomponent.html',
  styleUrl: './ubicacioncomponent.css',
})
export class Ubicacioncomponent implements OnInit, OnDestroy {
  columnas: string[] = ['idUbicacion', 'campus', 'edificio', 'piso', 'zona', 'tipo', 'acciones'];
  registros: UbicacionDTO[] = [];
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
    private servicio: Ubicacionservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      campus: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      edificio: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      piso: [
        null,
        [Validators.min(-2147483648), Validators.max(2147483647), Validators.pattern(/^-?\d+$/)],
      ],
      zona: ['', [Validators.maxLength(150)]],
      tipo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      latitud: [null, [Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.min(-180), Validators.max(180)]],
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
  abrir(registro: UbicacionDTO, modo: string): void {
    if (this.ocupado) return;
    this.cerrar();
    this.ocupado = true;
    this.suscripciones.add(
      this.servicio.obtener(registro.idUbicacion).subscribe({
        next: (datos) => {
          this.formulario.reset({
            campus: datos.campus,
            edificio: datos.edificio,
            piso: datos.piso,
            zona: datos.zona ?? '',
            tipo: datos.tipo,
            latitud: datos.latitud,
            longitud: datos.longitud,
          });
          this.idEditado = datos.idUbicacion;
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
      campus: '',
      edificio: '',
      piso: null,
      zona: '',
      tipo: '',
      latitud: null,
      longitud: null,
    });
  }
  guardar(): void {
    if (this.ocupado || this.modo === 'detalle' || !this.modo) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    if ((valores.latitud == null) !== (valores.longitud == null)) {
      this.errorAccion = 'Ingresa latitud y longitud juntas.';
      return;
    }
    const datos = new UbicacionFormularioDTO();
    datos.campus = valores.campus.trim();
    datos.edificio = valores.edificio.trim();
    datos.piso = valores.piso;
    datos.zona = valores.zona.trim() || null;
    datos.tipo = valores.tipo.trim();
    datos.latitud = valores.latitud;
    datos.longitud = valores.longitud;
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
  pedirEliminar(registro: UbicacionDTO): void {
    this.cerrar();
    this.pendiente = registro.idUbicacion;
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

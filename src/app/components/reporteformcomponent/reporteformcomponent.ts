import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { CategoriaDTO, ReporteDTO, UbicacionDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './reporteformcomponent.html',
  styleUrl: './reporteformcomponent.css',
})
export class Reporteformcomponent implements OnInit, OnDestroy {
  protected readonly esAdmin: boolean;
  protected readonly editando: boolean;
  protected readonly prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  protected readonly estados = [
    'ABIERTO',
    'EN_REVISION',
    'ASIGNADO',
    'EN_ATENCION',
    'RESUELTO',
    'CERRADO',
  ];
  protected cargando = true;
  protected guardando = false;
  protected listo = false;
  protected mensaje = '';
  protected readonly limiteDescripcionIA = 1000;
  protected consultandoIA = false;
  protected mensajeIA = '';
  protected sugerencia: CategoriaDTO | null = null;
  protected categoriasFiltradas: CategoriaDTO[] | null = null;
  protected buscandoCategorias = false;
  protected errorCategorias = '';
  protected categorias: CategoriaDTO[] = [];
  protected ubicaciones: UbicacionDTO[] = [];
  protected original: ReporteDTO | null = null;
  protected readonly formulario: FormGroup;
  private suscripciones = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: Reporteservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.esAdmin = this.acceso.rol() === 'ADMIN';
    this.editando = this.ruta.snapshot.paramMap.has('id');
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/)]],
      detalleUbicacion: ['', Validators.maxLength(255)],
      categoriaId: [null, Validators.required],
      ubicacionId: [null, Validators.required],
      estado: ['ABIERTO', Validators.required],
      prioridad: [null],
    });
    this.suscripciones.add(
      this.formulario.controls['descripcion'].valueChanges.subscribe(() => {
        this.sugerencia = null;
        this.mensajeIA = '';
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (this.editando && (!Number.isSafeInteger(id) || id < 1)) {
      this.mensaje = 'El identificador del reporte no es válido.';
      this.cargando = false;
      return;
    }
    this.suscripciones.add(
      this.servicio.categorias().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
          this.cargarUbicaciones(id);
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  protected opcionesCategoria(): CategoriaDTO[] {
    const filtradas = this.categoriasFiltradas;
    if (!filtradas) return this.categorias;
    const seleccionada = this.categorias.find(
      (c) => c.idCategoria === this.formulario.controls['categoriaId'].value,
    );
    return seleccionada && !filtradas.some((c) => c.idCategoria === seleccionada.idCategoria)
      ? [seleccionada, ...filtradas]
      : filtradas;
  }

  protected buscarCategorias(texto: string): void {
    if (this.buscandoCategorias) return;
    const palabra = texto.trim();
    this.errorCategorias = '';
    if (!palabra) {
      this.categoriasFiltradas = null;
      return;
    }
    this.buscandoCategorias = true;
    this.suscripciones.add(
      this.servicio.buscarCategorias(palabra).subscribe({
        next: (datos) => {
          this.categoriasFiltradas = datos;
          this.buscandoCategorias = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.acceso.revisarError(error);
          this.errorCategorias =
            'No se pudieron buscar categorías. Puedes usar el listado completo.';
          this.categoriasFiltradas = null;
          this.buscandoCategorias = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  protected descripcionIA(): string {
    return this.formulario.controls['descripcion'].value.trim();
  }

  protected sugerirCategoria(): void {
    const descripcion = this.descripcionIA();
    if (
      this.editando ||
      !this.listo ||
      !this.categorias.length ||
      this.guardando ||
      this.consultandoIA ||
      !descripcion ||
      descripcion.length > this.limiteDescripcionIA
    ) {
      return;
    }
    this.consultandoIA = true;
    this.sugerencia = null;
    this.mensajeIA = '';
    this.suscripciones.add(
      this.servicio.sugerirCategoria(descripcion).subscribe({
        next: ({ categoriaId }) => {
          this.consultandoIA = false;
          if (descripcion !== this.descripcionIA()) {
            this.cdr.detectChanges();
            return;
          }
          const categoria = this.categorias.find((item) => item.idCategoria === categoriaId);
          if (categoria) this.sugerencia = categoria;
          else
            this.mensajeIA =
              'No se encontró una categoría para esa descripción. Describe el daño con más detalle o elige una categoría en el formulario.';
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.consultandoIA = false;
          this.acceso.revisarError(error);
          if (descripcion !== this.descripcionIA()) {
            this.cdr.detectChanges();
            return;
          }
          const mensaje =
            error.status === 429
              ? 'Se alcanzó el límite de consultas de IA.'
              : error.status === 503
                ? 'El servicio de IA no está disponible en este momento.'
                : 'No se pudo consultar la sugerencia. Revisa la conexión y vuelve a intentarlo.';
          this.mensajeIA = mensaje + ' Puedes elegir la categoría en el formulario.';
          this.cdr.detectChanges();
        },
      }),
    );
  }

  protected usarSugerencia(): void {
    const categoria = this.sugerencia;
    if (!categoria || this.guardando) return;
    this.categoriasFiltradas = null;
    this.formulario.controls['categoriaId'].setValue(categoria.idCategoria);
    this.formulario.controls['categoriaId'].markAsDirty();
    this.sugerencia = null;
    this.mensajeIA = 'Categoría seleccionada. Puedes cambiarla antes de guardar.';
  }

  protected guardar(): void {
    if (!this.listo || this.guardando || this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    if (valores.categoriaId === null || valores.ubicacionId === null) return;
    const datos = {
      ...valores,
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      detalleUbicacion: valores.detalleUbicacion.trim() || null,
      categoriaId: valores.categoriaId,
      ubicacionId: valores.ubicacionId,
      tecnicoAsignadoId: this.original?.tecnicoAsignadoId ?? null,
    };
    this.guardando = true;
    this.mensaje = '';
    const peticion = this.original
      ? this.servicio.actualizar(this.original.idReporte, datos)
      : this.servicio.registrar(datos);
    this.suscripciones.add(
      peticion.subscribe({
        next: (resultado) => {
          this.guardando = false;
          this.aviso.open(
            this.editando ? 'Se actualizó la incidencia.' : 'Se registró la incidencia.',
            'Cerrar',
            { duration: 4000 },
          );
          void this.router.navigate(['/evidencias'], { queryParams: { id: resultado.idReporte } });
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarError(error, 'No se pudo guardar la incidencia.');
          this.guardando = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private mostrarError(error: unknown, mensaje: string): void {
    if (error instanceof HttpErrorResponse) {
      this.acceso.revisarError(error);
      if (error.status === 403) mensaje = 'No tienes permiso para acceder a este reporte.';
      if (error.status === 404)
        mensaje = 'El reporte o uno de los datos seleccionados ya no existe.';
      if (error.status === 400) mensaje = 'Revisa los datos del formulario.';
    }
    this.mensaje = mensaje;
  }

  private cargarUbicaciones(id: number): void {
    this.suscripciones.add(
      this.servicio.ubicaciones().subscribe({
        next: (ubicaciones) => {
          this.ubicaciones = ubicaciones;
          if (this.editando) this.cargarReporte(id);
          else this.prepararFormulario(null);
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  private cargarReporte(id: number): void {
    this.suscripciones.add(
      this.servicio.obtener(id).subscribe({
        next: (reporte) => this.prepararFormulario(reporte),
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  private prepararFormulario(reporte: ReporteDTO | null): void {
    this.original = reporte;
    if (reporte) {
      this.formulario.setValue({
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        detalleUbicacion: reporte.detalleUbicacion ?? '',
        categoriaId: reporte.categoriaId,
        ubicacionId: reporte.ubicacionId,
        estado: reporte.estado,
        prioridad: reporte.prioridad,
      });
    }
    this.listo = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el formulario.');
    this.cargando = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

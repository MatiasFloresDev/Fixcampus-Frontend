import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, of } from 'rxjs';
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
  ],
  templateUrl: './reporteformcomponent.html',
  styleUrl: './reporteformcomponent.css',
})
export class Reporteformcomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(Reporteservice);
  private readonly acceso = inject(Accesoservice);
  private readonly destruccion = inject(DestroyRef);
  protected readonly esAdmin = this.acceso.rol() === 'ADMIN';
  protected readonly editando = this.ruta.snapshot.paramMap.has('id');
  protected readonly prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  protected readonly estados = [
    'ABIERTO',
    'EN_REVISION',
    'ASIGNADO',
    'EN_ATENCION',
    'RESUELTO',
    'CERRADO',
  ];
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly listo = signal(false);
  protected readonly mensaje = signal('');
  protected readonly limiteDescripcionIA = 1000;
  protected readonly consultandoIA = signal(false);
  protected readonly mensajeIA = signal('');
  protected readonly sugerencia = signal<CategoriaDTO | null>(null);
  protected categorias: CategoriaDTO[] = [];
  protected ubicaciones: UbicacionDTO[] = [];
  protected original: ReporteDTO | null = null;

  protected readonly formulario = this.fb.group({
    titulo: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(200),
    ]),
    descripcion: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/)]),
    detalleUbicacion: this.fb.nonNullable.control('', Validators.maxLength(255)),
    categoriaId: this.fb.control<number | null>(null, Validators.required),
    ubicacionId: this.fb.control<number | null>(null, Validators.required),
    estado: this.fb.nonNullable.control('ABIERTO', Validators.required),
    prioridad: this.fb.control<string | null>(null),
  });

  constructor() {
    this.formulario.controls.descripcion.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sugerencia.set(null);
      this.mensajeIA.set('');
    });
  }

  protected descripcionIA(): string {
    return this.formulario.controls.descripcion.value.trim();
  }

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (this.editando && (!Number.isSafeInteger(id) || id < 1)) {
      this.mensaje.set('El identificador del reporte no es válido.');
      this.cargando.set(false);
      return;
    }
    forkJoin({
      categorias: this.servicio.categorias(),
      ubicaciones: this.servicio.ubicaciones(),
      reporte: this.editando ? this.servicio.obtener(id) : of(null),
    }).subscribe({
      next: ({ categorias, ubicaciones, reporte }) => {
        this.categorias = categorias;
        this.ubicaciones = ubicaciones;
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
        this.listo.set(true);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarError(error, 'No se pudo cargar el formulario.');
        this.cargando.set(false);
      },
    });
  }

  protected sugerirCategoria(): void {
    const descripcion = this.descripcionIA();
    if (
      this.editando ||
      !this.listo() ||
      !this.categorias.length ||
      this.guardando() ||
      this.consultandoIA() ||
      !descripcion ||
      descripcion.length > this.limiteDescripcionIA
    ) {
      return;
    }

    this.consultandoIA.set(true);
    this.sugerencia.set(null);
    this.mensajeIA.set('');
    this.servicio
      .sugerirCategoria(descripcion)
      .pipe(takeUntilDestroyed(this.destruccion))
      .subscribe({
        next: ({ categoriaId }) => {
          this.consultandoIA.set(false);
          if (descripcion !== this.descripcionIA()) return;
          const categoria = this.categorias.find((item) => item.idCategoria === categoriaId);
          if (categoria) this.sugerencia.set(categoria);
          else
            this.mensajeIA.set(
              'No hay una sugerencia para esta descripción. Elige la categoría en el formulario.',
            );
        },
        error: (error: HttpErrorResponse) => {
          this.consultandoIA.set(false);
          this.acceso.revisarError(error);
          if (descripcion !== this.descripcionIA()) return;
          const mensaje =
            error.status === 429
              ? 'Se alcanzó el límite de consultas de IA.'
              : 'La sugerencia de IA no está disponible.';
          this.mensajeIA.set(mensaje + ' Puedes elegir la categoría en el formulario.');
        },
      });
  }

  protected usarSugerencia(): void {
    const categoria = this.sugerencia();
    if (!categoria || this.guardando()) return;
    this.formulario.controls.categoriaId.setValue(categoria.idCategoria);
    this.formulario.controls.categoriaId.markAsDirty();
    this.sugerencia.set(null);
    this.mensajeIA.set('Categoría seleccionada. Puedes cambiarla antes de guardar.');
  }

  protected guardar(): void {
    if (!this.listo() || this.guardando() || this.formulario.invalid) return;
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
    this.guardando.set(true);
    this.mensaje.set('');
    const peticion = this.original
      ? this.servicio.actualizar(this.original.idReporte, datos)
      : this.servicio.registrar(datos);
    peticion.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        void this.router.navigate(['/evidencias'], { queryParams: { id: resultado.idReporte } });
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarError(error, 'No se pudo guardar la incidencia.');
        this.guardando.set(false);
      },
    });
  }

  private mostrarError(error: unknown, mensaje: string): void {
    if (error instanceof HttpErrorResponse) {
      this.acceso.revisarError(error);
      if (error.status === 403) mensaje = 'No tienes permiso para acceder a este reporte.';
      if (error.status === 404)
        mensaje = 'El reporte o uno de los datos seleccionados ya no existe.';
      if (error.status === 400) mensaje = 'Revisa los datos del formulario.';
    }
    this.mensaje.set(mensaje);
  }
}

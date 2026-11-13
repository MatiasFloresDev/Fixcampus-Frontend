import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComentarioDTO } from '../../models/ComentarioDTO';
import { RecomendacionDTO } from '../../models/RecomendacionDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Comentarioservice } from '../../services/comentarioservice';
import { Recomendacionservice } from '../../services/recomendacionservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  templateUrl: './seguimientocomponent.html',
  styleUrl: './seguimientocomponent.css',
})
export class Seguimientocomponent implements OnInit, OnDestroy {
  protected readonly reporteId: number;
  protected reporte: ReporteDTO | null = null;
  protected comentarios: ComentarioDTO[] = [];
  protected paginaComentarios = 0;
  protected porPaginaComentarios = 5;
  protected pestana: 'recomendaciones' | 'comentarios';
  protected recomendacion: RecomendacionDTO | null = null;
  protected editado: ComentarioDTO | null = null;
  protected pendiente: {
    tipo: 'comentario' | 'recomendacion';
    id: number;
  } | null = null;
  protected cargando = false;
  protected guardando = false;
  protected error = '';
  protected aviso = '';
  protected readonly prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  private readonly texto = [Validators.required, Validators.pattern(/\S/)];
  protected readonly comentarioForm: FormGroup;
  protected readonly recomendacionForm: FormGroup;
  private suscripciones = new Subscription();

  constructor(
    private acceso: Accesoservice,
    private comentariosApi: Comentarioservice,
    private recomendacionesApi: Recomendacionservice,
    private reportesApi: Reporteservice,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.reporteId = Number(this.ruta.snapshot.paramMap.get('id'));
    this.pestana =
      this.ruta.snapshot.queryParamMap.get('pestana') === 'recomendaciones'
        ? 'recomendaciones'
        : 'comentarios';
    this.comentarioForm = this.fb.group({
      textoComentario: ['', [...this.texto, Validators.maxLength(2000)]],
    });
    this.recomendacionForm = this.fb.group({
      tituloSugerido: ['', [...this.texto, Validators.maxLength(200)]],
      resumen: ['', this.texto],
      prioridadSugerida: ['MEDIA', Validators.required],
      justificacion: ['', this.texto],
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected comentariosVisibles(): ComentarioDTO[] {
    return this.comentarios.slice(
      this.paginaComentarios * this.porPaginaComentarios,
      (this.paginaComentarios + 1) * this.porPaginaComentarios,
    );
  }

  protected cambiarPaginaComentarios(evento: PageEvent): void {
    this.paginaComentarios = evento.pageIndex;
    this.porPaginaComentarios = evento.pageSize;
  }

  protected cargar(): void {
    if (!Number.isSafeInteger(this.reporteId) || this.reporteId < 1) {
      this.error = 'El número de reporte no es válido.';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.suscripciones.add(
      this.reportesApi.obtener(this.reporteId).subscribe({
        next: (reporte) => {
          this.reporte = reporte;
          this.cargarComentarios();
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  protected editarComentario(comentario: ComentarioDTO): void {
    this.editado = comentario;
    this.comentarioForm.setValue({ textoComentario: comentario.textoComentario });
  }

  protected cancelarComentario(): void {
    this.editado = null;
    this.comentarioForm.reset({ textoComentario: '' });
  }

  protected guardarComentario(): void {
    if (this.guardarBloqueado() || this.comentarioForm.invalid) return;
    const texto = this.comentarioForm.getRawValue().textoComentario.trim();
    const anterior = this.editado;
    const peticion = anterior
      ? this.comentariosApi.actualizar(anterior, texto)
      : this.comentariosApi.registrar(this.reporteId, texto);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    this.suscripciones.add(
      peticion.subscribe({
        next: (comentario) => {
          this.comentarios = anterior
            ? this.comentarios.map((item) =>
                item.idComentario === comentario.idComentario ? comentario : item,
              )
            : [comentario, ...this.comentarios];
          this.cancelarComentario();
          this.paginaComentarios = 0;
          this.aviso = 'Se guardó el comentario.';
          this.guardando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.falloOperacion(error),
      }),
    );
  }

  protected guardarRecomendacion(): void {
    if (this.guardarBloqueado() || this.recomendacionForm.invalid) return;
    const valores = this.recomendacionForm.getRawValue();
    const datos = {
      reporteId: this.reporteId,
      tituloSugerido: valores.tituloSugerido.trim(),
      resumen: valores.resumen.trim(),
      prioridadSugerida: valores.prioridadSugerida,
      justificacion: valores.justificacion.trim(),
    };
    const id = this.recomendacion?.idRecomendacion;
    const peticion = id
      ? this.recomendacionesApi.actualizar(id, datos)
      : this.recomendacionesApi.registrar(datos);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    this.suscripciones.add(
      peticion.subscribe({
        next: (recomendacion) => {
          this.recomendacion = recomendacion;
          this.aviso = 'Se guardó la recomendación.';
          this.guardando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.falloOperacion(error),
      }),
    );
  }

  protected eliminar(): void {
    const pendiente = this.pendiente;
    if (!pendiente || this.guardando) return;
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    if (pendiente.tipo === 'comentario') {
      this.suscripciones.add(
        this.comentariosApi.eliminar(pendiente.id).subscribe({
          next: () => {
            this.comentarios = this.comentarios.filter(
              (item) => item.idComentario !== pendiente.id,
            );
            if (this.editado?.idComentario === pendiente.id) this.cancelarComentario();
            this.paginaComentarios = Math.min(
              this.paginaComentarios,
              Math.max(0, Math.ceil(this.comentarios.length / this.porPaginaComentarios) - 1),
            );
            this.pendiente = null;
            this.aviso = 'Se eliminó el comentario.';
            this.guardando = false;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => this.falloOperacion(error),
        }),
      );
    } else {
      this.suscripciones.add(
        this.recomendacionesApi.eliminar(pendiente.id).subscribe({
          next: () => {
            this.recomendacion = null;
            this.recomendacionForm.reset({
              tituloSugerido: '',
              resumen: '',
              prioridadSugerida: 'MEDIA',
              justificacion: '',
            });
            this.pendiente = null;
            this.aviso = 'Se eliminó la recomendación.';
            this.guardando = false;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => this.falloOperacion(error),
        }),
      );
    }
  }

  protected guardarBloqueado(): boolean {
    return this.guardando || this.cargando || !this.reporte || !!this.pendiente;
  }

  private falloOperacion(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo completar la operación.');
    this.guardando = false;
    this.cdr.detectChanges();
  }

  private mostrarError(error: HttpErrorResponse, respaldo: string): void {
    this.acceso.revisarError(error);
    this.error =
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : respaldo;
  }

  private cargarComentarios(): void {
    this.suscripciones.add(
      this.comentariosApi.listar(this.reporteId).subscribe({
        next: (comentarios) => {
          this.comentarios = comentarios;
          this.cargarRecomendacion();
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  private cargarRecomendacion(): void {
    this.suscripciones.add(
      this.recomendacionesApi.porReporte(this.reporteId).subscribe({
        next: (recomendacion) => {
          this.recomendacion = recomendacion;
          this.recomendacionForm.reset(
            recomendacion ?? {
              tituloSugerido: '',
              resumen: '',
              prioridadSugerida: 'MEDIA',
              justificacion: '',
            },
          );
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el seguimiento.');
    this.cargando = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

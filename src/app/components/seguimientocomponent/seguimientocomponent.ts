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
import { ComentarioDTO } from '../../models/ComentarioDTO';
import { RecomendacionDTO } from '../../models/RecomendacionDTO';
import { RecomendacionFormularioDTO } from '../../models/RecomendacionFormularioDTO';
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
  reporteId: number;
  reporte: ReporteDTO | null = null;
  comentarios: ComentarioDTO[] = [];
  paginaComentarios = 0;
  porPaginaComentarios = 5;
  pestana: 'recomendaciones' | 'comentarios';
  recomendacion: RecomendacionDTO | null = null;
  editado: ComentarioDTO | null = null;
  pendiente: {
    tipo: 'comentario' | 'recomendacion';
    id: number;
  } | null = null;
  cargando = false;
  guardando = false;
  error = '';
  aviso = '';
  prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  private texto = [Validators.required, Validators.pattern(/\S/)];
  comentarioForm: FormGroup;
  recomendacionForm: FormGroup;
  private activo = true;

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
    if (!this.acceso.validarSesion(true)) return;
    this.cargar();
  }

  comentariosVisibles(): ComentarioDTO[] {
    return this.comentarios.slice(
      this.paginaComentarios * this.porPaginaComentarios,
      (this.paginaComentarios + 1) * this.porPaginaComentarios,
    );
  }

  cambiarPaginaComentarios(evento: PageEvent): void {
    this.paginaComentarios = evento.pageIndex;
    this.porPaginaComentarios = evento.pageSize;
  }

  cargar(): void {
    if (!Number.isSafeInteger(this.reporteId) || this.reporteId < 1) {
      this.error = 'El número de reporte no es válido.';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.reportesApi.obtener(this.reporteId).subscribe({
      next: (reporte) => {
        if (!this.activo) return;
        this.reporte = reporte;
        this.cargarComentarios();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.falloCarga(error);
      },
    });
  }

  editarComentario(comentario: ComentarioDTO): void {
    this.editado = comentario;
    this.comentarioForm.setValue({ textoComentario: comentario.textoComentario });
  }

  cancelarComentario(): void {
    this.editado = null;
    this.comentarioForm.reset({ textoComentario: '' });
  }

  guardarComentario(): void {
    if (this.guardarBloqueado() || this.comentarioForm.invalid) return;
    const texto = this.comentarioForm.getRawValue().textoComentario.trim();
    const anterior = this.editado;
    const peticion = anterior
      ? this.comentariosApi.actualizar(anterior, texto)
      : this.comentariosApi.registrar(this.reporteId, texto);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    peticion.subscribe({
      next: (comentario) => {
        if (!this.activo) return;
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
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.falloOperacion(error);
      },
    });
  }

  guardarRecomendacion(): void {
    if (this.guardarBloqueado() || this.recomendacionForm.invalid) return;
    const valores = this.recomendacionForm.getRawValue();
    const datos = new RecomendacionFormularioDTO();
    datos.reporteId = this.reporteId;
    datos.tituloSugerido = valores.tituloSugerido.trim();
    datos.resumen = valores.resumen.trim();
    datos.prioridadSugerida = valores.prioridadSugerida;
    datos.justificacion = valores.justificacion.trim();
    const id = this.recomendacion?.idRecomendacion;
    const peticion = id
      ? this.recomendacionesApi.actualizar(id, datos)
      : this.recomendacionesApi.registrar(datos);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    peticion.subscribe({
      next: (recomendacion) => {
        if (!this.activo) return;
        this.recomendacion = recomendacion;
        this.aviso = 'Se guardó la recomendación.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.falloOperacion(error);
      },
    });
  }

  eliminar(): void {
    const pendiente = this.pendiente;
    if (!pendiente || this.guardando) return;
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    if (pendiente.tipo === 'comentario') {
      this.comentariosApi.eliminar(pendiente.id).subscribe({
        next: () => {
          if (!this.activo) return;
          this.comentarios = this.comentarios.filter((item) => item.idComentario !== pendiente.id);
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
        error: (error: HttpErrorResponse) => {
          if (!this.activo) return;
          this.falloOperacion(error);
        },
      });
    } else {
      this.recomendacionesApi.eliminar(pendiente.id).subscribe({
        next: () => {
          if (!this.activo) return;
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
        error: (error: HttpErrorResponse) => {
          if (!this.activo) return;
          this.falloOperacion(error);
        },
      });
    }
  }

  guardarBloqueado(): boolean {
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
    this.comentariosApi.listar(this.reporteId).subscribe({
      next: (comentarios) => {
        if (!this.activo) return;
        this.comentarios = comentarios;
        this.cargarRecomendacion();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.falloCarga(error);
      },
    });
  }

  private cargarRecomendacion(): void {
    this.recomendacionesApi.porReporte(this.reporteId).subscribe({
      next: (recomendacion) => {
        if (!this.activo) return;
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
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.falloCarga(error);
      },
    });
  }

  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el seguimiento.');
    this.cargando = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.activo = false;
  }
}

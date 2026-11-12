import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, Observable } from 'rxjs';
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
  styles: `
    .seguimiento,
    form {
      display: grid;
      gap: 16px;
    }
    .seguimiento {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
      align-items: start;
    }
    form {
      margin-block: 16px;
    }
    article {
      border-block-end: 1px solid #d6dbe0;
      padding-block: 12px;
    }
    article p {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .acciones {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pestanas {
      display: flex;
      gap: 24px;
      margin: 24px 0;
      border-bottom: 1px solid #d6dbde;
    }

    .pestanas button {
      border-radius: 0;
      padding: 12px 16px;
      color: #666;
      border-bottom: 3px solid transparent;
    }

    .pestanas button.activa {
      color: #0d6a62;
      border-bottom-color: #0d6a62;
      font-weight: 600;
    }

    .tarjeta[hidden] {
      display: none !important;
    }
  `,
})
export class Seguimientocomponent implements OnInit {
  private readonly acceso = inject(Accesoservice);
  private readonly comentariosApi = inject(Comentarioservice);
  private readonly recomendacionesApi = inject(Recomendacionservice);
  private readonly reportesApi = inject(Reporteservice);
  private readonly destruccion = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly reporteId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly reporte = signal<ReporteDTO | null>(null);
  protected readonly comentarios = signal<ComentarioDTO[]>([]);
  protected readonly paginaComentarios = signal(0);
  protected readonly porPaginaComentarios = signal(5);

  protected comentariosVisibles(): ComentarioDTO[] {
    return this.comentarios().slice(
      this.paginaComentarios() * this.porPaginaComentarios(),
      (this.paginaComentarios() + 1) * this.porPaginaComentarios(),
    );
  }

  protected cambiarPaginaComentarios(evento: PageEvent): void {
    this.paginaComentarios.set(evento.pageIndex);
    this.porPaginaComentarios.set(evento.pageSize);
  }
  protected readonly pestana = signal<'recomendaciones' | 'comentarios'>(
    inject(ActivatedRoute).snapshot.queryParamMap.get('pestana') === 'recomendaciones'
      ? 'recomendaciones'
      : 'comentarios',
  );

  protected readonly recomendacion = signal<RecomendacionDTO | null>(null);
  protected readonly editado = signal<ComentarioDTO | null>(null);
  protected readonly pendiente = signal<{
    tipo: 'comentario' | 'recomendacion';
    id: number;
  } | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  private readonly texto = [Validators.required, Validators.pattern(/\S/)];
  protected readonly comentarioForm = this.fb.group({
    textoComentario: ['', [...this.texto, Validators.maxLength(2000)]],
  });
  protected readonly recomendacionForm = this.fb.group({
    tituloSugerido: ['', [...this.texto, Validators.maxLength(200)]],
    resumen: ['', this.texto],
    prioridadSugerida: ['MEDIA', Validators.required],
    justificacion: ['', this.texto],
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    if (!Number.isSafeInteger(this.reporteId) || this.reporteId < 1) {
      this.error.set('El número de reporte no es válido.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      reporte: this.reportesApi.obtener(this.reporteId),
      comentarios: this.comentariosApi.listar(this.reporteId),
      recomendacion: this.recomendacionesApi.porReporte(this.reporteId),
    })
      .pipe(
        takeUntilDestroyed(this.destruccion),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ({ reporte, comentarios, recomendacion }) => {
          this.reporte.set(reporte);
          this.comentarios.set(comentarios);
          this.recomendacion.set(recomendacion);
          this.recomendacionForm.reset(recomendacion ?? undefined);
        },
        error: (error: HttpErrorResponse) =>
          this.mostrarError(error, 'No se pudo cargar el seguimiento.'),
      });
  }

  protected editarComentario(comentario: ComentarioDTO): void {
    this.editado.set(comentario);
    this.comentarioForm.setValue({ textoComentario: comentario.textoComentario });
  }

  protected cancelarComentario(): void {
    this.editado.set(null);
    this.comentarioForm.reset();
  }

  protected guardarComentario(): void {
    if (this.guardarBloqueado() || this.comentarioForm.invalid) return;
    const texto = this.comentarioForm.getRawValue().textoComentario.trim();
    const anterior = this.editado();
    const peticion = anterior
      ? this.comentariosApi.actualizar(anterior, texto)
      : this.comentariosApi.registrar(this.reporteId, texto);
    this.ejecutar(peticion, 'Se guardó el comentario.', (comentario) => {
      this.comentarios.update((lista) =>
        anterior
          ? lista.map((item) => (item.idComentario === comentario.idComentario ? comentario : item))
          : [comentario, ...lista],
      );
      this.cancelarComentario();
      this.paginaComentarios.set(0);
    });
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
    const id = this.recomendacion()?.idRecomendacion;
    const peticion = id
      ? this.recomendacionesApi.actualizar(id, datos)
      : this.recomendacionesApi.registrar(datos);
    this.ejecutar(peticion, 'Se guardó la recomendación.', (item) => this.recomendacion.set(item));
  }

  protected eliminar(): void {
    const pendiente = this.pendiente();
    if (!pendiente || this.guardando()) return;
    if (pendiente.tipo === 'comentario') {
      this.ejecutar(this.comentariosApi.eliminar(pendiente.id), 'Se eliminó el comentario.', () => {
        this.comentarios.update((lista) =>
          lista.filter((item) => item.idComentario !== pendiente.id),
        );
        if (this.editado()?.idComentario === pendiente.id) this.cancelarComentario();
        this.paginaComentarios.set(
          Math.min(
            this.paginaComentarios(),
            Math.max(0, Math.ceil(this.comentarios().length / this.porPaginaComentarios()) - 1),
          ),
        );
        this.pendiente.set(null);
      });
    } else {
      this.ejecutar(
        this.recomendacionesApi.eliminar(pendiente.id),
        'Se eliminó la recomendación.',
        () => {
          this.recomendacion.set(null);
          this.recomendacionForm.reset();
          this.pendiente.set(null);
        },
      );
    }
  }

  protected guardarBloqueado(): boolean {
    return this.guardando() || this.cargando() || !this.reporte() || !!this.pendiente();
  }

  private ejecutar<T>(peticion: Observable<T>, mensaje: string, aplicar: (datos: T) => void): void {
    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');
    peticion
      .pipe(
        takeUntilDestroyed(this.destruccion),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (datos) => {
          aplicar(datos);
          this.aviso.set(mensaje);
        },
        error: (error: HttpErrorResponse) =>
          this.mostrarError(error, 'No se pudo completar la operación.'),
      });
  }

  private mostrarError(error: HttpErrorResponse, respaldo: string): void {
    this.acceso.revisarError(error);
    this.error.set(
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : respaldo,
    );
  }
}

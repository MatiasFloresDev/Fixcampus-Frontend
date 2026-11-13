import { Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdjuntoDTO, ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  selector: 'app-evidenciascomponent',
  imports: [
    DatePipe,
    MatButtonModule,
    MatPaginatorModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './evidenciascomponent.html',
  styleUrl: './evidenciascomponent.css',
})
export class Evidenciascomponent implements OnInit, OnDestroy {
  readonly prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  prioridad = '';
  pagina = 0;
  porPagina = 5;
  paginaAdjuntos = 0;
  porPaginaAdjuntos = 5;
  lista: ReporteDTO[] = [];
  reporte?: ReporteDTO;
  adjuntos: AdjuntoDTO[] = [];
  cargandoLista = true;
  cargandoAdjuntos = false;
  errorLista = '';
  errorAdjuntos = '';
  eliminando = false;
  errorEliminar = '';
  confirmacionEliminar: ReporteDTO | undefined = undefined;
  guardandoAdjunto = false;
  adjuntoEditado: AdjuntoDTO | null = null;
  adjuntoPendiente: AdjuntoDTO | null = null;
  avisoAdjunto = '';
  readonly adjuntoForm: FormGroup;
  private suscripciones = new Subscription();

  constructor(
    public acceso: Accesoservice,
    private servicio: Reporteservice,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
    fb: FormBuilder,
  ) {
    this.adjuntoForm = fb.group({
      nombreArchivo: [
        '',
        [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)],
      ],
      urlArchivo: [
        '',
        [Validators.required, Validators.maxLength(500), Validators.pattern(/^https?:\/\/.+/i)],
      ],
      tipoArchivo: ['', Validators.maxLength(100)],
    });
  }

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(prioridad = this.prioridad): void {
    if (prioridad !== this.prioridad) {
      this.prioridad = prioridad;
      this.pagina = 0;
      this.seleccionar('');
    }
    this.errorLista = '';
    this.cargandoLista = true;
    this.suscripciones.add(
      this.servicio.listar(this.prioridad).subscribe({
        next: (datos) => {
          this.lista = datos;
          this.pagina = Math.min(
            this.pagina,
            Math.max(0, Math.ceil(datos.length / this.porPagina) - 1),
          );
          this.cargandoLista = false;
          const id = this.ruta.snapshot.queryParamMap.get('id');
          if (id && !this.reporte) this.seleccionar(id);
          this.cdr.detectChanges();
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.acceso.revisarError(error);
          this.errorLista = 'No se pudo consultar tus reportes.';
          this.cargandoLista = false;
          this.cdr.detectChanges();
          this.cdr.detectChanges();
        },
      }),
    );
  }

  seleccionar(id: string): void {
    if (this.guardandoAdjunto) return;
    this.paginaAdjuntos = 0;
    this.cancelarAdjunto();
    this.errorEliminar = '';
    this.reporte = this.lista.find((reporte) => reporte.idReporte === Number(id));
    this.cargarAdjuntos();
  }

  editarAdjunto(adjunto: AdjuntoDTO): void {
    this.cancelarAdjunto();
    this.adjuntoEditado = adjunto;
    this.adjuntoForm.setValue({
      nombreArchivo: adjunto.nombreArchivo,
      urlArchivo: adjunto.urlArchivo,
      tipoArchivo: adjunto.tipoArchivo ?? '',
    });
  }

  cancelarAdjunto(): void {
    this.adjuntoEditado = null;
    this.adjuntoPendiente = null;
    this.adjuntoForm.reset({ nombreArchivo: '', urlArchivo: '', tipoArchivo: '' });
    this.avisoAdjunto = '';
  }

  guardarAdjunto(): void {
    if (this.acceso.rol() !== 'ADMIN' || !this.reporte || this.guardandoAdjunto) return;
    this.adjuntoForm.markAllAsTouched();
    if (this.adjuntoForm.invalid) return;
    const valores = this.adjuntoForm.getRawValue();
    const url = this.enlaceArchivo(valores.urlArchivo.trim());
    if (!url) {
      this.adjuntoForm.controls['urlArchivo'].setErrors({ pattern: true });
      return;
    }
    const datos = {
      reporteId: this.reporte.idReporte,
      nombreArchivo: valores.nombreArchivo.trim(),
      urlArchivo: url,
      tipoArchivo: valores.tipoArchivo.trim() || null,
    };
    const id = this.adjuntoEditado?.idAdjunto;
    const peticion = id
      ? this.servicio.actualizarAdjunto(id, datos)
      : this.servicio.registrarAdjunto(datos);
    this.guardandoAdjunto = true;
    this.errorAdjuntos = '';
    this.suscripciones.add(
      peticion.subscribe({
        next: () => {
          this.guardandoAdjunto = false;
          this.cancelarAdjunto();
          this.avisoAdjunto = 'Se guardó la evidencia.';
          this.cargarAdjuntos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.falloAdjunto(error);
          this.cdr.detectChanges();
        },
      }),
    );
  }

  eliminarAdjunto(): void {
    const adjunto = this.adjuntoPendiente;
    if (!adjunto || this.guardandoAdjunto || this.acceso.rol() !== 'ADMIN') return;
    this.guardandoAdjunto = true;
    this.suscripciones.add(
      this.servicio.eliminarAdjunto(adjunto.idAdjunto).subscribe({
        next: () => {
          this.guardandoAdjunto = false;
          this.cancelarAdjunto();
          this.avisoAdjunto = 'Se eliminó la evidencia.';
          this.cargarAdjuntos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.falloAdjunto(error);
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private falloAdjunto(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.guardandoAdjunto = false;
    this.errorAdjuntos =
      typeof error.error?.message === 'string'
        ? error.error.message
        : 'No se pudo guardar el cambio en las evidencias.';
    this.cdr.detectChanges();
  }

  get filasReportes(): ReporteDTO[] {
    return this.lista.slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }

  get filasAdjuntos(): AdjuntoDTO[] {
    return this.adjuntos.slice(
      this.paginaAdjuntos * this.porPaginaAdjuntos,
      (this.paginaAdjuntos + 1) * this.porPaginaAdjuntos,
    );
  }

  cambiarPaginaAdjuntos(evento: PageEvent): void {
    this.paginaAdjuntos = evento.pageIndex;
    this.porPaginaAdjuntos = evento.pageSize;
  }

  cargarAdjuntos(): void {
    const reporte = this.reporte;
    this.adjuntos = [];
    this.errorAdjuntos = '';
    if (!reporte) {
      this.cargandoAdjuntos = false;
      return;
    }
    this.cargandoAdjuntos = true;
    this.suscripciones.add(
      this.servicio.evidencias(reporte.idReporte).subscribe({
        next: (datos) => {
          if (this.reporte?.idReporte !== reporte.idReporte) return;
          this.adjuntos = datos;
          this.paginaAdjuntos = Math.min(
            this.paginaAdjuntos,
            Math.max(0, Math.ceil(datos.length / this.porPaginaAdjuntos) - 1),
          );
          this.cargandoAdjuntos = false;
          this.cdr.detectChanges();
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          if (this.reporte?.idReporte !== reporte.idReporte) return;
          this.acceso.revisarError(error);
          this.errorAdjuntos =
            error.status === 403
              ? 'No tienes permiso para ver estas evidencias.'
              : 'No se pudieron cargar las evidencias.';
          this.cargandoAdjuntos = false;
          this.cdr.detectChanges();
          this.cdr.detectChanges();
        },
      }),
    );
  }

  eliminarReporte(): void {
    const seleccionado = this.confirmacionEliminar;
    if (!seleccionado || this.eliminando || this.acceso.rol() !== 'ADMIN') return;
    this.eliminando = true;
    this.errorEliminar = '';
    this.suscripciones.add(
      this.servicio.eliminar(seleccionado.idReporte).subscribe({
        next: () => {
          this.confirmacionEliminar = undefined;
          this.reporte = undefined;
          this.adjuntos = [];
          this.eliminando = false;
          this.cargarReportes();
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.acceso.revisarError(error);
          this.errorEliminar =
            error.status === 409
              ? 'El reporte tiene datos relacionados. Retíralos antes de eliminarlo.'
              : 'No se pudo eliminar el reporte.';
          this.eliminando = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  enlaceArchivo(url: string): string | null {
    try {
      const enlace = new URL(url);
      if (enlace.protocol === 'https:' || enlace.protocol === 'http:') return enlace.href;
    } catch {
      return null;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

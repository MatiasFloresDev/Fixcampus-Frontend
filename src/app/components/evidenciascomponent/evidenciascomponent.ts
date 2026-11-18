import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AdjuntoDTO } from '../../models/AdjuntoDTO';
import { AdjuntoFormularioDTO } from '../../models/AdjuntoFormularioDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Adjuntoservice } from '../../services/adjuntoservice';
@Component({
  selector: 'app-evidenciascomponent',
  imports: [
    MatButtonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './evidenciascomponent.html',
  styleUrl: './evidenciascomponent.css',
})
export class Evidenciascomponent implements OnInit {
  @Input() reporteId = 0;
  adjuntos: AdjuntoDTO[] = [];
  paginaAdjuntos = 0;
  porPaginaAdjuntos = 5;
  cargandoAdjuntos = false;
  errorAdjuntos = '';
  guardandoAdjunto = false;
  adjuntoEditado: AdjuntoDTO | null = null;
  adjuntoPendiente: AdjuntoDTO | null = null;
  avisoAdjunto = '';
  adjuntoForm: FormGroup;
  constructor(
    public acceso: Accesoservice,
    private servicio: Adjuntoservice,
    private cdr: ChangeDetectorRef,
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
    if (!this.acceso.validarSesion() || !Number.isSafeInteger(this.reporteId) || this.reporteId < 1)
      return;
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
    if (this.acceso.rol() !== 'ADMIN' || !this.reporteId || this.guardandoAdjunto) return;
    this.adjuntoForm.markAllAsTouched();
    if (this.adjuntoForm.invalid) return;
    const valores = this.adjuntoForm.getRawValue();
    const url = this.enlaceArchivo(valores.urlArchivo.trim());
    if (!url) {
      this.adjuntoForm.controls['urlArchivo'].setErrors({ pattern: true });
      return;
    }
    const datos = new AdjuntoFormularioDTO();
    datos.reporteId = this.reporteId;
    datos.nombreArchivo = valores.nombreArchivo.trim();
    datos.urlArchivo = url;
    datos.tipoArchivo = valores.tipoArchivo.trim() || null;
    const id = this.adjuntoEditado?.idAdjunto;
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.registrar(datos);
    this.guardandoAdjunto = true;
    this.errorAdjuntos = '';
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
    });
  }
  eliminarAdjunto(): void {
    const adjunto = this.adjuntoPendiente;
    if (!adjunto || this.guardandoAdjunto || this.acceso.rol() !== 'ADMIN') return;
    this.guardandoAdjunto = true;
    this.servicio.eliminar(adjunto.idAdjunto).subscribe({
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
    });
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
  filasAdjuntos(): AdjuntoDTO[] {
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
    const id = this.reporteId;
    this.adjuntos = [];
    this.errorAdjuntos = '';
    if (!id) {
      this.cargandoAdjuntos = false;
      return;
    }
    this.cargandoAdjuntos = true;
    this.servicio.listarPorReporte(id).subscribe({
      next: (datos) => {
        if (this.reporteId !== id) return;
        this.adjuntos = datos;
        this.paginaAdjuntos = Math.min(
          this.paginaAdjuntos,
          Math.max(0, Math.ceil(datos.length / this.porPaginaAdjuntos) - 1),
        );
        this.cargandoAdjuntos = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (this.reporteId !== id) return;
        this.acceso.revisarError(error);
        this.errorAdjuntos =
          error.status === 403
            ? 'No tienes permiso para ver estas evidencias.'
            : 'No se pudieron cargar las evidencias.';
        this.cargandoAdjuntos = false;
        this.cdr.detectChanges();
      },
    });
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
}

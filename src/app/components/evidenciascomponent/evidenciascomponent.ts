import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { AdjuntoDTO, ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  selector: 'app-evidenciascomponent',
  imports: [DatePipe, MatButtonModule, RouterLink],
  templateUrl: './evidenciascomponent.html',
  styleUrl: './evidenciascomponent.css',
})
export class Evidenciascomponent implements OnInit {
  lista: ReporteDTO[] = [];
  reporte?: ReporteDTO;
  adjuntos: AdjuntoDTO[] = [];
  cargandoLista = true;
  cargandoAdjuntos = false;
  errorLista = '';
  errorAdjuntos = '';
  readonly eliminando = signal(false);
  readonly errorEliminar = signal('');
  readonly confirmacionEliminar = signal<ReporteDTO | undefined>(undefined);

  constructor(
    public acceso: Accesoservice,
    private servicio: Reporteservice,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.errorLista = '';
    this.cargandoLista = true;
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.lista = datos;
        this.cargandoLista = false;
        const id = this.ruta.snapshot.queryParamMap.get('id');
        if (id && !this.reporte) this.seleccionar(id);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.errorLista = 'No se pudo consultar tus reportes.';
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionar(id: string): void {
    this.errorEliminar.set('');
    this.reporte = this.lista.find((reporte) => reporte.idReporte === Number(id));
    this.cargarAdjuntos();
  }

  cargarAdjuntos(): void {
    const reporte = this.reporte;
    this.adjuntos = [];
    this.errorAdjuntos = '';
    if (!reporte) return;
    this.cargandoAdjuntos = true;
    this.servicio.evidencias(reporte.idReporte).subscribe({
      next: (datos) => {
        this.adjuntos = datos;
        this.cargandoAdjuntos = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
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

  eliminarReporte(): void {
    const seleccionado = this.confirmacionEliminar();
    if (!seleccionado || this.eliminando() || this.acceso.rol() !== 'ADMIN') return;
    this.eliminando.set(true);
    this.errorEliminar.set('');
    this.servicio.eliminar(seleccionado.idReporte).subscribe({
      next: () => {
        this.confirmacionEliminar.set(undefined);
        this.reporte = undefined;
        this.adjuntos = [];
        this.eliminando.set(false);
        this.cargarReportes();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.errorEliminar.set(
          error.status === 409
            ? 'El reporte tiene datos relacionados. Retíralos antes de eliminarlo.'
            : 'No se pudo eliminar el reporte.',
        );
        this.eliminando.set(false);
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

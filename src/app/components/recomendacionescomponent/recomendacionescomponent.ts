import { Subscription } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Reporteservice } from '../../services/reporteservice';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { RecomendacionDTO } from '../../models/RecomendacionDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Recomendacionservice } from '../../services/recomendacionservice';

@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink,
    MatPaginatorModule,
  ],
  templateUrl: './recomendacionescomponent.html',
  styleUrl: './recomendacionescomponent.css',
})
export class Recomendacionescomponent implements OnInit, OnDestroy {
  protected prioridad = '';
  protected recomendaciones: RecomendacionDTO[] = [];
  protected cargando = false;
  protected error = '';
  protected pagina = 0;
  protected porPagina = 5;
  protected reportes: ReporteDTO[] = [];
  protected busqueda = '';
  private suscripciones = new Subscription();

  constructor(
    private servicio: Recomendacionservice,
    private acceso: Accesoservice,
    private reportesApi: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  protected buscar(texto: string): void {
    this.busqueda = texto;
    this.pagina = 0;
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }

  protected filas(): RecomendacionDTO[] {
    return this.recomendacionesFiltradas().slice(
      this.pagina * this.porPagina,
      (this.pagina + 1) * this.porPagina,
    );
  }

  protected tituloReporte(id: number): string {
    return this.reportes.find((r) => r.idReporte === id)?.titulo ?? `Reporte #${id}`;
  }

  protected recomendacionesFiltradas(): RecomendacionDTO[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.recomendaciones.filter(
      (item) =>
        item.tituloSugerido.toLowerCase().includes(texto) ||
        this.tituloReporte(item.reporteId).toLowerCase().includes(texto) ||
        String(item.reporteId).includes(texto),
    );
  }

  protected cargar(prioridad = this.prioridad): void {
    this.pagina = 0;
    this.prioridad = prioridad;
    this.error = '';
    this.cargando = true;
    this.suscripciones.add(
      this.servicio.listar(prioridad).subscribe({
        next: (recomendaciones) => {
          this.recomendaciones = recomendaciones;
          this.cargarTitulos();
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  protected eliminarRecomendacion(item: RecomendacionDTO): void {
    const confirmar = window.confirm('¿Deseas eliminar esta recomendación?');
    if (!confirmar) return;
    this.cargando = true;
    this.suscripciones.add(
      this.servicio.eliminar(item.idRecomendacion).subscribe({
        next: () => {
          this.recomendaciones = this.recomendaciones.filter(
            (r) => r.idRecomendacion !== item.idRecomendacion,
          );
          this.pagina = Math.min(
            this.pagina,
            Math.max(0, Math.ceil(this.recomendacionesFiltradas().length / this.porPagina) - 1),
          );
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.acceso.revisarError(error);
          this.error = 'No se pudo eliminar la recomendación.';
          this.cargando = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private cargarTitulos(): void {
    this.suscripciones.add(
      this.reportesApi.listar().subscribe({
        next: (reportes) => {
          this.reportes = reportes;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.falloCarga(error),
      }),
    );
  }

  private falloCarga(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error = 'No se pudieron cargar las recomendaciones.';
    this.cargando = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

import { forkJoin } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Reporteservice } from '../../services/reporteservice';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
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
export class Recomendacionescomponent implements OnInit {
  private readonly servicio = inject(Recomendacionservice);
  private readonly acceso = inject(Accesoservice);
  protected readonly prioridad = signal('');
  protected readonly recomendaciones = signal<RecomendacionDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly pagina = signal(0);
  protected readonly porPagina = signal(5);

  protected buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.porPagina.set(evento.pageSize);
  }

  protected filas(): RecomendacionDTO[] {
    return this.recomendacionesFiltradas().slice(
      this.pagina() * this.porPagina(),
      (this.pagina() + 1) * this.porPagina(),
    );
  }

  ngOnInit(): void {
    this.cargar();
  }
  private readonly reportesApi = inject(Reporteservice);
  protected readonly reportes = signal<ReporteDTO[]>([]);
  protected readonly busqueda = signal('');

  protected tituloReporte(id: number): string {
    return this.reportes().find((r) => r.idReporte === id)?.titulo ?? `Reporte #${id}`;
  }

  protected recomendacionesFiltradas(): RecomendacionDTO[] {
    const texto = this.busqueda().toLowerCase().trim();

    return this.recomendaciones().filter(
      (item) =>
        item.tituloSugerido.toLowerCase().includes(texto) ||
        this.tituloReporte(item.reporteId).toLowerCase().includes(texto) ||
        String(item.reporteId).includes(texto),
    );
  }

  protected cargar(prioridad = this.prioridad()): void {
    this.pagina.set(0);
    this.prioridad.set(prioridad);
    this.error.set('');
    this.cargando.set(true);

    forkJoin({
      recomendaciones: this.servicio.listar(prioridad),
      reportes: this.reportesApi.listar(),
    }).subscribe({
      next: ({ recomendaciones, reportes }) => {
        this.recomendaciones.set(recomendaciones);
        this.reportes.set(reportes);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error.set('No se pudieron cargar las recomendaciones.');
        this.cargando.set(false);
      },
    });
  }

  protected eliminarRecomendacion(item: RecomendacionDTO): void {
    const confirmar = window.confirm('¿Deseas eliminar esta recomendación?');

    if (!confirmar) return;

    this.cargando.set(true);
    this.servicio.eliminar(item.idRecomendacion).subscribe({
      next: () => {
        this.recomendaciones.update((lista) =>
          lista.filter((r) => r.idRecomendacion !== item.idRecomendacion),
        );
        this.pagina.set(
          Math.min(
            this.pagina(),
            Math.max(0, Math.ceil(this.recomendacionesFiltradas().length / this.porPagina()) - 1),
          ),
        );
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error.set('No se pudo eliminar la recomendación.');
        this.cargando.set(false);
      },
    });
  }
}

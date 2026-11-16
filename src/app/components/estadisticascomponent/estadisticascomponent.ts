import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { TotalCategoriaDTO } from '../../models/TotalCategoriaDTO';
import { TotalPrioridadDTO } from '../../models/TotalPrioridadDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Estadisticaservice } from '../../services/estadisticaservice';

@Component({
  imports: [MatButtonModule],
  templateUrl: './estadisticascomponent.html',
  styleUrl: './estadisticascomponent.css',
})
export class Estadisticascomponent implements OnInit, OnDestroy {
  categorias: TotalCategoriaDTO[] = [];
  prioridades: TotalPrioridadDTO[] = [];
  cargando = false;
  error = false;
  private suscripciones = new Subscription();

  constructor(
    private servicio: Estadisticaservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;
    this.suscripciones.add(
      this.servicio.reportesPorCategoria().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
          this.cargarPrioridades();
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      }),
    );
  }

  private cargarPrioridades(): void {
    this.suscripciones.add(
      this.servicio.recomendacionesPorPrioridad().subscribe({
        next: (prioridades) => {
          this.prioridades = prioridades;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      }),
    );
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  get totalReportes(): number {
    return this.categorias.reduce((acc, c) => acc + (c.totalReportes || 0), 0);
  }

  get categoriaMasFrecuente(): string {
    if (!this.categorias.length) return 'Ninguna';
    const ordenada = [...this.categorias].sort(
      (a, b) => (b.totalReportes || 0) - (a.totalReportes || 0),
    );
    return ordenada[0].totalReportes > 0 ? ordenada[0].nombre : 'Ninguna';
  }

  get totalCategorias(): number {
    return this.categorias.length;
  }

  get promedioPorCategoria(): string {
    if (!this.categorias.length) return '0';
    return (this.totalReportes / this.categorias.length).toFixed(1);
  }

  get maxReportes(): number {
    return Math.max(...this.categorias.map((c) => c.totalReportes || 0), 1);
  }

  get maxPrioridades(): number {
    return Math.max(...this.prioridades.map((p) => p.cantidad || 0), 1);
  }

  calcularPorcentaje(cantidad: number, max: number): number {
    if (!max || max <= 0 || !cantidad || cantidad <= 0) return 0;
    return Math.min(100, Math.round((cantidad / max) * 100));
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

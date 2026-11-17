import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
  private activo = true;

  constructor(
    private servicio: Estadisticaservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;
    this.servicio.reportesPorCategoria().subscribe({
      next: (categorias) => {
        if (!this.activo) return;
        this.categorias = categorias;
        this.cargarPrioridades();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.mostrarError(error);
      },
    });
  }

  private cargarPrioridades(): void {
    this.servicio.recomendacionesPorPrioridad().subscribe({
      next: (prioridades) => {
        if (!this.activo) return;
        this.prioridades = prioridades;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.mostrarError(error);
      },
    });
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  totalReportes(): number {
    let total = 0;
    for (const categoria of this.categorias) {
      total += categoria.totalReportes || 0;
    }
    return total;
  }

  categoriaMasFrecuente(): string {
    let nombre = 'Ninguna';
    let mayorCantidad = 0;
    for (const categoria of this.categorias) {
      if (categoria.totalReportes > mayorCantidad) {
        mayorCantidad = categoria.totalReportes;
        nombre = categoria.nombre;
      }
    }
    return nombre;
  }

  totalCategorias(): number {
    return this.categorias.length;
  }

  promedioPorCategoria(): string {
    if (!this.categorias.length) return '0';
    return (this.totalReportes() / this.categorias.length).toFixed(1);
  }

  maxReportes(): number {
    let maximo = 1;
    for (const categoria of this.categorias) {
      if (categoria.totalReportes > maximo) maximo = categoria.totalReportes;
    }
    return maximo;
  }

  maxPrioridades(): number {
    let maximo = 1;
    for (const prioridad of this.prioridades) {
      if (prioridad.cantidad > maximo) maximo = prioridad.cantidad;
    }
    return maximo;
  }

  calcularPorcentaje(cantidad: number, max: number): number {
    if (!max || max <= 0 || !cantidad || cantidad <= 0) return 0;
    return Math.min(100, Math.round((cantidad / max) * 100));
  }

  ngOnDestroy(): void {
    this.activo = false;
  }
}

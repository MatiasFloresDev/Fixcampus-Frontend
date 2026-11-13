import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { TotalCategoriaDTO, TotalPrioridadDTO } from '../../models/EstadisticaDTO';
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

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}

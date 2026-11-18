import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TotalCategoriaDTO } from '../../models/TotalCategoriaDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Estadisticaservice } from '../../services/estadisticaservice';
@Component({
  selector: 'app-categoriasgraficocomponent',
  imports: [BaseChartDirective, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './categoriasgraficocomponent.html',
  styleUrl: './categoriasgraficocomponent.css',
})
export class Categoriasgraficocomponent implements OnInit {
  lista: TotalCategoriaDTO[] = [];
  cargando = true;
  mensaje = '';
  total = 0;
  chartType: 'bar' | 'doughnut' = 'bar';
  chartData: ChartData<'bar' | 'doughnut'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar' | 'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
  constructor(
    private servicio: Estadisticaservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (this.acceso.validarSesion(true)) this.cargar();
  }
  cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.reportesPorCategoria().subscribe({
      next: (datos) => {
        this.lista = datos;
        this.total = 0;
        for (const item of datos) this.total += item.totalReportes;
        this.chartData = {
          labels: datos.map((item) => item.nombre),
          datasets: [
            {
              label: 'Incidencias',
              data: datos.map((item) => item.totalReportes),
              backgroundColor: ['#126b64', '#4a9690', '#5c8da5', '#9dc953', '#b16e25', '#86bcb7'],
              borderWidth: 1,
            },
          ],
        };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.mensaje = 'No se pudo cargar el gráfico.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
  cambiarTipo(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: this.chartType === 'doughnut', position: 'bottom' } },
      scales: this.chartType === 'bar' ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : {},
    };
  }
  categoriaMasFrecuente(): string {
    let nombre = 'Ninguna';
    let mayor = 0;
    for (const item of this.lista) {
      if (item.totalReportes > mayor) {
        mayor = item.totalReportes;
        nombre = item.nombre;
      }
    }
    return nombre;
  }
  promedio(): string {
    return this.lista.length ? (this.total / this.lista.length).toFixed(1) : '0';
  }
}

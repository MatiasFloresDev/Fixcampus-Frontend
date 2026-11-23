import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionesPorPrioridadReporteDTO } from '../../../models/RecomendacionesPorPrioridadReporteDTO';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reporte03component',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './reporte03component.html',
  styleUrl: './reporte03component.css',
})
export class Reporte03component implements OnInit {
  lista: RecomendacionesPorPrioridadReporteDTO[] = [];
  mensaje = '';

  public chartType: TipoGrafico = 'pie';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Recomendaciones',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Recomendaciones por prioridad del reporte' },
    },
  };

  constructor(
    private recS: Recomendacionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.recS.contarPorPrioridadReporte().subscribe({
      next: (data: RecomendacionesPorPrioridadReporteDTO[]) => {
        this.lista = data;
        this.mensaje = data.length === 0 ? 'No hay datos registrados para mostrar.' : '';
        this.chartData = {
          labels: data.map((item) => item.prioridad || 'Sin asignar'),
          datasets: [
            {
              label: 'Cantidad de recomendaciones',
              data: data.map((item) => item.cantidad),
              backgroundColor: ['#C0392B', '#9A5B00', '#5C8FAA', '#5F6B70'],
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reporte 03:', error);
        this.mensaje = 'No se pudo cargar el reporte de recomendaciones por prioridad.';
        this.cdr.detectChanges();
      },
    });
  }
}
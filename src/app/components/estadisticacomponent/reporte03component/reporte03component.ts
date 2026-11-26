import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionesPorPrioridadReporteDTO } from '../../../models/RecomendacionesPorPrioridadReporteDTO';

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

  private readonly paleta = ['#C0392B', '#9A5B00', '#5C8FAA', '#5F6B70', '#0D6A62', '#1E7E4A'];

  public chartType: 'pie' = 'pie';

  public chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de recomendaciones',
        data: [],
        backgroundColor: this.paleta,
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 16,
          generateLabels: (chart) => {
            const labels = chart.data.labels ?? [];
            const dataset = chart.data.datasets[0];
            if (!dataset) return [];
            const valores = dataset.data as number[];
            const total = valores.reduce((acc, val) => acc + Number(val || 0), 0);
            const colors = Array.isArray(dataset.backgroundColor)
              ? (dataset.backgroundColor as string[])
              : [dataset.backgroundColor as string];

            return labels.map((label, index) => {
              const valor = Number(valores[index] || 0);
              const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
              const color = colors[index % colors.length] || '#5C8FAA';
              return {
                text: `${label}: ${valor} (${porcentaje}%)`,
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1,
                hidden: !chart.getDataVisibility(index),
                index,
              };
            });
          },
        },
      },
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
              backgroundColor: data.map((_, i) => this.paleta[i % this.paleta.length]),
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
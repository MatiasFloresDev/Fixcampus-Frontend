import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Reporteservice } from '../../../services/reporteservice';
import { IncidenciasPorMesDTO } from '../../../models/IncidenciasPorMesDTO';

@Component({
  selector: 'app-reporte02component',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './reporte02component.html',
  styleUrl: './reporte02component.css',
})
export class Reporte02component implements OnInit {
  lista: IncidenciasPorMesDTO[] = [];
  mensaje = '';

  private readonly paleta = ['#0D6A62', '#408F86', '#5C8FAA', '#9A5B00', '#1E7E4A', '#2B5B84'];

  public chartType: 'bar' = 'bar';

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Incidencias registradas',
        data: [],
        backgroundColor: this.paleta,
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        onClick: () => {},
        labels: {
          padding: 16,
          generateLabels: (chart) => {
            const labels = chart.data.labels ?? [];
            const dataset = chart.data.datasets[0];
            if (!dataset) return [];
            const colors = Array.isArray(dataset.backgroundColor)
              ? (dataset.backgroundColor as string[])
              : [dataset.backgroundColor as string];

            return labels.map((label, index) => {
              const color = colors[index % colors.length] || '#408F86';
              return {
                text: `${label}: ${dataset.data[index]}`,
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1,
                hidden: false,
                index,
              };
            });
          },
        },
      },
      title: { display: true, text: 'Incidencias por usuario y mes' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Usuario y periodo (mes/año)' },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        title: { display: true, text: 'Incidencias registradas' },
      },
    },
  };

  constructor(
    private rS: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.rS.incidenciasPorUsuarioYMes().subscribe({
      next: (data: IncidenciasPorMesDTO[]) => {
        this.lista = data;
        this.mensaje = data.length === 0 ? 'No hay datos registrados para mostrar.' : '';
        this.chartData = {
          labels: data.map(
            (item) => `${item.nombre} ${item.apellido} (${item.mes}/${item.anio})`,
          ),
          datasets: [
            {
              label: 'Incidencias registradas',
              data: data.map((item) => item.cantidad),
              backgroundColor: data.map((_, i) => this.paleta[i % this.paleta.length]),
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reporte 02:', error);
        this.mensaje = 'No se pudo cargar el reporte de incidencias por usuario y mes.';
        this.cdr.detectChanges();
      },
    });
  }
}
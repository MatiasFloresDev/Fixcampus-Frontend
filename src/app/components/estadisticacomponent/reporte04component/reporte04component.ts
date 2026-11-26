import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuariosPorRolDTO } from '../../../models/UsuariosPorRolDTO';

@Component({
  selector: 'app-reporte04component',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './reporte04component.html',
  styleUrl: './reporte04component.css',
})
export class Reporte04component implements OnInit {
  lista: UsuariosPorRolDTO[] = [];
  mensaje = '';

  private readonly paleta = ['#0D6A62', '#5C8FAA', '#408F86', '#9A5B00', '#1E7E4A', '#2B5B84'];

  public chartType: 'doughnut' = 'doughnut';

  public chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de usuarios',
        data: [],
        backgroundColor: this.paleta,
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions<'doughnut'> = {
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
              const color = colors[index % colors.length] || '#0D6A62';
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
      title: { display: true, text: 'Distribución de usuarios por rol' },
    },
  };

  constructor(
    private uS: Usuarioservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.uS.usuariosPorRol().subscribe({
      next: (data: UsuariosPorRolDTO[]) => {
        this.lista = data;
        this.mensaje = data.length === 0 ? 'No hay datos registrados para mostrar.' : '';
        this.chartData = {
          labels: data.map((item) => item.rol),
          datasets: [
            {
              label: 'Cantidad de usuarios',
              data: data.map((item) => item.cantidad),
              backgroundColor: data.map((_, i) => this.paleta[i % this.paleta.length]),
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reporte 04:', error);
        this.mensaje = 'No se pudo cargar el reporte de usuarios por rol.';
        this.cdr.detectChanges();
      },
    });
  }
}
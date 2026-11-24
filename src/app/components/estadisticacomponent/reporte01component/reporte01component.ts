import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Reporteservice } from '../../../services/reporteservice';
import { IncidenciasPorCategoriaDTO } from '../../../models/IncidenciasPorCategoriaDTO';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reporte01component',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './reporte01component.html',
  styleUrl: './reporte01component.css',
})
export class Reporte01component implements OnInit {
  lista: IncidenciasPorCategoriaDTO[] = [];
  mensaje = '';

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de incidencias',
        data: [],
        backgroundColor: '#0D6A62',
        borderColor: '#0D6A62',
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Incidencias por categoría' },
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
    this.rS.incidenciasPorCategoria().subscribe({
      next: (data: IncidenciasPorCategoriaDTO[]) => {
        this.lista = data;
        this.mensaje = data.length === 0 ? 'No hay datos registrados para mostrar.' : '';
        this.chartData = {
          labels: data.map((item) => item.categoria),
          datasets: [
            {
              label: 'Cantidad de incidencias',
              data: data.map((item) => item.cantidad),
              backgroundColor: ['#0D6A62', '#408F86', '#5C8FAA', '#9A5B00', '#1E7E4A'],
              borderWidth: 1,
            },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reporte 01:', error);
        this.mensaje = 'No se pudo cargar el reporte de incidencias por categoría.';
        this.cdr.detectChanges();
      },
    });
  }
}
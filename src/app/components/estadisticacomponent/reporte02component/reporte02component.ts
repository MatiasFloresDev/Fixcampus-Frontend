import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Reporteservice } from '../../../services/reporteservice';
import { IncidenciasPorMesDTO } from '../../../models/IncidenciasPorMesDTO';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

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

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Incidencias registradas',
        data: [],
        backgroundColor: '#408F86',
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Incidencias por usuario y mes' },
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
              backgroundColor: '#408F86',
              borderColor: '#0D6A62',
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
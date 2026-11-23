import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuariosPorRolDTO } from '../../../models/UsuariosPorRolDTO';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

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

  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Usuarios',
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
              backgroundColor: ['#0D6A62', '#5C8FAA', '#408F86', '#9A5B00'],
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
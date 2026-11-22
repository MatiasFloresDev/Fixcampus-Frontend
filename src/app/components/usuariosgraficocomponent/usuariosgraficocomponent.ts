import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { UsuariosPorRolDTO } from '../../models/UsuariosPorRolDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Estadisticaservice } from '../../services/estadisticaservice';

@Component({
  selector: 'app-usuariosgraficocomponent',
  imports: [BaseChartDirective, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './usuariosgraficocomponent.html',
  styleUrl: './usuariosgraficocomponent.css',
})
export class Usuariosgraficocomponent implements OnInit {
  lista: UsuariosPorRolDTO[] = [];
  total = 0;
  cargando = false;
  mensaje = '';
  chartType: 'doughnut' | 'bar' = 'doughnut';
  chartData: ChartData<'doughnut' | 'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'doughnut' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } },
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
    if (this.cargando) return;
    this.cargando = true;
    this.mensaje = '';
    this.servicio.usuariosPorRol().subscribe({
      next: (datos) => {
        this.lista = datos;
        this.total = 0;
        for (const item of datos) this.total += item.cantidadUsuarios;
        this.chartData = {
          labels: datos.map((item) => item.nombreRol),
          datasets: [
            {
              label: 'Usuarios',
              data: datos.map((item) => item.cantidadUsuarios),
              backgroundColor: ['#126b64', '#5c8da5', '#9dc953', '#b16e25', '#4a9690'],
              borderWidth: 1,
            },
          ],
        };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.mensaje = 'No se pudo consultar la cantidad de usuarios por rol.';
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
}

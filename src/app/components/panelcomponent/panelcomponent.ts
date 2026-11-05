import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { IncidenciasPorMesDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  selector: 'app-panelcomponent',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './panelcomponent.html',
  styleUrl: './panelcomponent.css',
})
export class Panelcomponent implements OnInit {
  filas: IncidenciasPorMesDTO[] = [];
  cargando = true;
  mensaje = '';
  maximo = 1;
  mesReciente = 0;
  indicadores?: { reportes: number; abiertos: number; resueltos: number; usuarios: number };

  constructor(
    private reportes: Reporteservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarGrafico();
    forkJoin({
      reportes: this.reportes.listar(),
      usuarios: this.reportes.contarUsuarios(),
    }).subscribe({
      next: ({ reportes, usuarios }) => {
        this.indicadores = {
          reportes: reportes.length,
          abiertos: reportes.filter((r) => r.estado.toUpperCase() === 'ABIERTO').length,
          resueltos: reportes.filter((r) =>
            ['RESUELTO', 'CERRADO'].includes(r.estado.toUpperCase()),
          ).length,
          usuarios,
        };
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => this.acceso.revisarError(error),
    });
  }

  cargarGrafico(): void {
    this.cargando = true;
    this.mensaje = '';
    this.reportes.incidenciasPorMes().subscribe({
      next: (datos) => {
        this.filas = datos.sort(
          (a, b) => b.anio - a.anio || b.mes - a.mes || b.cantidad - a.cantidad,
        );
        this.maximo = Math.max(1, ...datos.map((dato) => dato.cantidad));
        this.mesReciente = Math.max(0, ...datos.map((dato) => dato.anio * 100 + dato.mes));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.cargando = false;
        this.mensaje =
          error.status === 403
            ? 'Tu cuenta no tiene permiso para ver el panel.'
            : 'No se pudo cargar el gráfico.';
        this.cdr.detectChanges();
      },
    });
  }
}

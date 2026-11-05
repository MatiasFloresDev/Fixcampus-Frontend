import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { IncidenciasPorMesDTO, ReporteDTO } from '../../models/ReporteDTO';
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
  indicadores?: { reportes: number; abiertos: number; resueltos: number };
  usuarios?: number;
  readonly esAdmin: boolean;

  constructor(
    private reportes: Reporteservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {
    this.esAdmin = acceso.rol() === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarGrafico();
    if (!this.esAdmin) return;
    this.reportes.listar().subscribe({
      next: (reportes) => {
        this.indicadores = this.contarReportes(reportes);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => this.acceso.revisarError(error),
    });
    this.reportes.contarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => this.acceso.revisarError(error),
    });
  }

  cargarGrafico(): void {
    this.cargando = true;
    this.mensaje = '';
    if (!this.esAdmin) {
      this.reportes.listar().subscribe({
        next: (reportes) => {
          this.indicadores = this.contarReportes(reportes);
          this.mostrarGrafico(this.agruparMisReportes(reportes));
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
      return;
    }

    this.reportes.incidenciasPorMes().subscribe({
      next: (datos) => this.mostrarGrafico(datos),
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  private contarReportes(reportes: ReporteDTO[]) {
    return {
      reportes: reportes.length,
      abiertos: reportes.filter((r) => r.estado.toUpperCase() === 'ABIERTO').length,
      resueltos: reportes.filter((r) => ['RESUELTO', 'CERRADO'].includes(r.estado.toUpperCase()))
        .length,
    };
  }

  private agruparMisReportes(reportes: ReporteDTO[]): IncidenciasPorMesDTO[] {
    const meses: IncidenciasPorMesDTO[] = [];
    for (const reporte of reportes) {
      if (!reporte.fechaCreacion) continue;
      const [anioTexto, mesTexto] = reporte.fechaCreacion.split('-');
      const anio = Number(anioTexto);
      const mes = Number(mesTexto);
      if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) continue;
      const fila = meses.find((dato) => dato.anio === anio && dato.mes === mes);
      if (fila) {
        fila.cantidad++;
      } else {
        meses.push({
          usuarioId: 0,
          nombre: 'Mis reportes',
          apellido: '',
          anio,
          mes,
          cantidad: 1,
        });
      }
    }
    return meses;
  }

  private mostrarGrafico(datos: IncidenciasPorMesDTO[]): void {
    this.filas = datos.sort((a, b) => b.anio - a.anio || b.mes - a.mes || b.cantidad - a.cantidad);
    this.maximo = Math.max(1, ...datos.map((dato) => dato.cantidad));
    this.mesReciente = Math.max(0, ...datos.map((dato) => dato.anio * 100 + dato.mes));
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.cargando = false;
    this.mensaje =
      error.status === 403
        ? 'Tu cuenta no tiene permiso para consultar estos datos.'
        : 'No se pudo cargar el gráfico.';
    this.cdr.detectChanges();
  }
}

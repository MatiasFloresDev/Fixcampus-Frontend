import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { IncidenciasPorMesDTO } from '../../models/IncidenciasPorMesDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';
import { Usuarioservice } from '../../services/usuarioservice';

@Component({
  selector: 'app-resumencomponent',
  imports: [BaseChartDirective, RouterLink, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './resumencomponent.html',
  styleUrl: './resumencomponent.css',
})
export class Resumencomponent implements OnInit {
  filas: IncidenciasPorMesDTO[] = [];
  filasFiltradas: IncidenciasPorMesDTO[] = [];
  listaReportes?: ReporteDTO[];
  meses: { valor: string; nombre: string }[] = [];
  mesSeleccionado = '';
  cargando = false;
  cargandoIndicadores = false;
  cargandoUsuarios = false;
  mensaje = '';
  mensajeIndicadores = '';
  mensajeUsuarios = '';
  chartType: 'bar' | 'line' = 'bar';
  chartData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
    plugins: { legend: { display: false } },
  };
  mesReciente = 0;
  indicadores?: { reportes: number; abiertos: number; enAtencion: number; resueltos: number };
  usuarios?: number;
  esAdmin: boolean;

  constructor(
    private reportes: Reporteservice,
    private usuariosApi: Usuarioservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {
    this.esAdmin = acceso.rol() === 'ADMIN';
  }

  ngOnInit(): void {
    if (!this.acceso.validarSesion()) return;
    this.actualizarPanel();
  }

  actualizando(): boolean {
    return this.cargando || this.cargandoIndicadores || this.cargandoUsuarios;
  }

  nombrePeriodo(): string {
    return (
      this.meses.find((mes) => mes.valor === this.mesSeleccionado)?.nombre ?? 'Todos los meses'
    );
  }

  actualizarPanel(): void {
    if (this.actualizando()) return;
    this.cargarGrafico();
    if (!this.esAdmin) return;

    this.cargandoIndicadores = true;
    this.mensajeIndicadores = '';
    this.listaReportes = undefined;
    this.indicadores = undefined;
    this.reportes.listar().subscribe({
      next: (reportes) => {
        this.listaReportes = reportes;
        this.cargandoIndicadores = false;
        this.filtrarPorMes();
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.cargandoIndicadores = false;
        this.mensajeIndicadores =
          'No se pudieron cargar los totales de reportes. Pulsa Actualizar para volver a consultar.';
        this.cdr.detectChanges();
      },
    });

    this.cargandoUsuarios = true;
    this.mensajeUsuarios = '';
    this.usuarios = undefined;
    this.usuariosApi.contar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargandoUsuarios = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.cargandoUsuarios = false;
        this.mensajeUsuarios =
          'No se pudo consultar el total de usuarios. Pulsa Actualizar para volver a consultar.';
        this.cdr.detectChanges();
      },
    });
  }

  cargarGrafico(): void {
    this.cargando = true;
    this.mensaje = '';
    if (!this.esAdmin) {
      this.listaReportes = undefined;
      this.indicadores = undefined;
      this.reportes.listar().subscribe({
        next: (reportes) => {
          this.listaReportes = reportes;
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

  filtrarPorMes(): void {
    this.filasFiltradas = this.filas.filter(
      (fila) => !this.mesSeleccionado || this.periodo(fila.anio, fila.mes) === this.mesSeleccionado,
    );
    this.chartData = {
      labels: this.filasFiltradas.map(
        (fila) => fila.nombre + ' ' + fila.apellido + ' · ' + fila.mes + '/' + fila.anio,
      ),
      datasets: [
        {
          label: 'Incidencias',
          data: this.filasFiltradas.map((fila) => fila.cantidad),
          backgroundColor: '#126b64',
          borderColor: '#126b64',
          borderWidth: 1,
        },
      ],
    };
    if (this.listaReportes) {
      const reportes = this.listaReportes.filter(
        (reporte) =>
          !this.mesSeleccionado || reporte.fechaCreacion?.slice(0, 7) === this.mesSeleccionado,
      );
      this.indicadores = this.contarReportes(reportes);
    }
  }

  cambiarTipo(): void {
    this.chartOptions = {
      ...this.chartOptions,
      indexAxis: this.chartType === 'bar' ? 'y' : 'x',
      scales:
        this.chartType === 'bar'
          ? { x: { beginAtZero: true, ticks: { precision: 0 } } }
          : { y: { beginAtZero: true, ticks: { precision: 0 } } },
    };
  }
  limpiarFiltro(): void {
    this.mesSeleccionado = '';
    this.filtrarPorMes();
  }

  private contarReportes(reportes: ReporteDTO[]) {
    return {
      reportes: reportes.length,
      abiertos: reportes.filter((r) => r.estado.toUpperCase() === 'ABIERTO').length,
      enAtencion: reportes.filter((r) =>
        ['EN_REVISION', 'ASIGNADO', 'EN_ATENCION', 'EN_PROCESO'].includes(r.estado.toUpperCase()),
      ).length,
      resueltos: reportes.filter((r) => ['RESUELTO', 'CERRADO'].includes(r.estado.toUpperCase()))
        .length,
    };
  }

  private periodo(anio: number, mes: number): string {
    return anio + '-' + String(mes).padStart(2, '0');
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
      if (fila) fila.cantidad++;
      else
        meses.push({ usuarioId: 0, nombre: 'Mis reportes', apellido: '', anio, mes, cantidad: 1 });
    }
    return meses;
  }

  private mostrarGrafico(datos: IncidenciasPorMesDTO[]): void {
    this.filas = datos.sort((a, b) => b.anio - a.anio || b.mes - a.mes || b.cantidad - a.cantidad);
    this.mesReciente = Math.max(0, ...datos.map((dato) => dato.anio * 100 + dato.mes));
    const nombres = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    this.meses = [];
    for (const fila of this.filas) {
      const valor = this.periodo(fila.anio, fila.mes);
      if (!this.meses.some((mes) => mes.valor === valor)) {
        this.meses.push({ valor, nombre: nombres[fila.mes - 1] + ' de ' + fila.anio });
      }
    }
    if (!this.meses.some((mes) => mes.valor === this.mesSeleccionado)) this.mesSeleccionado = '';
    this.filtrarPorMes();
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

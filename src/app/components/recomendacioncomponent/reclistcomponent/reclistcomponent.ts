import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOList } from '../../../models/RecomendacionDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reclistcomponent',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './reclistcomponent.html',
  styleUrl: './reclistcomponent.css',
})
export class Reclistcomponent implements OnInit {
  displayedColumns: string[] = [
    'idRecomendacion',
    'reporteId',
    'tituloSugerido',
    'prioridadSugerida',
    'fechaRecomendacion',
    'acciones',
  ];
  dataSource: RecomendacionDTOList[] = [];
  reportes: ReporteDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReportes = '';

  constructor(
    private service: Recomendacionservice,
    private reporteService: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarRelaciones();
  }

  listar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.service.listar().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los registros de recomendaciones.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRelaciones(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReportes = 'No se pudieron cargar los títulos de los reportes.';
        this.cdr.markForCheck();
      },
    });
  }

  nombreReporte(id: number): string {
    const reporte = this.reportes.find((reporte) => reporte.idReporte === id);
    if (!reporte) return 'Reporte #' + id;
    return '#' + id + ' · ' + reporte.titulo;
  }

  eliminar(registro: RecomendacionDTOList): void {
    if (this.eliminando) return;
    const confirmado = confirm('¿Eliminar esta recomendación? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idRecomendacion).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: (error) => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar la recomendación.';
        if (error.status === 403) this.mensaje = 'No tiene permiso para eliminar este registro.';
        this.cdr.markForCheck();
      },
    });
  }
}

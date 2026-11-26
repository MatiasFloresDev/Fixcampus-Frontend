import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOList } from '../../../models/RecomendacionDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reclistcomponent',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
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
  dataSource = new MatTableDataSource<RecomendacionDTOList>([]);
  reportes: ReporteDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReportes = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

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
        this.dataSource.data = data;
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
    return reporte ? reporte.titulo : 'Reporte no disponible';
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
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar la recomendación.';
        this.cdr.markForCheck();
      },
    });
  }
}

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { Reporteservice } from '../../../services/reporteservice';
import { RecomendacionDTOList } from '../../../models/RecomendacionDTOList';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reporte09component',
  standalone: true,
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reporte09component.html',
  styleUrl: './reporte09component.css',
})
export class Reporte09component implements OnInit {
  dataSource = new MatTableDataSource<RecomendacionDTOList>([]);
  reportes: ReporteDTOList[] = [];
  displayedColumns: string[] = [
    'reporteId',
    'tituloSugerido',
    'prioridadSugerida',
    'fechaRecomendacion',
  ];
  prioridadSeleccionada = '';
  prioridades = [
    { value: 'ALTA', viewValue: 'Alta' },
    { value: 'MEDIA', viewValue: 'Media' },
    { value: 'BAJA', viewValue: 'Baja' },
  ];
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private recS: Recomendacionservice,
    private reporteService: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.cdr.detectChanges();
      },
    });
  }

  nombreReporte(id: number): string {
    const reporte = this.reportes.find((r) => r.idReporte === id);
    return reporte ? reporte.titulo : 'Reporte no disponible';
  }

  buscar(): void {
    this.dataSource.paginator?.firstPage();
    if (!this.prioridadSeleccionada) {
      this.dataSource.data = [];
      this.mensaje = 'Seleccione una prioridad sugerida.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource.data = [];

    this.recS.buscarPorPrioridad(this.prioridadSeleccionada).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje =
          data.length === 0 ? 'No se encontraron recomendaciones con esa prioridad.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar recomendaciones:', error);
        this.dataSource.data = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
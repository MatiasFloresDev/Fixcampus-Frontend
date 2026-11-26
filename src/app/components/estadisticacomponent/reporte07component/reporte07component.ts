import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reporte07component',
  standalone: true,
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reporte07component.html',
  styleUrl: './reporte07component.css',
})
export class Reporte07component {
  dataSource = new MatTableDataSource<ReporteDTOList>([]);
  displayedColumns: string[] = ['titulo', 'prioridad', 'estado', 'fechaCreacion'];
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
    private rS: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscar(): void {
    this.dataSource.paginator?.firstPage();
    if (!this.prioridadSeleccionada) {
      this.dataSource.data = [];
      this.mensaje = 'Seleccione una prioridad.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource.data = [];

    this.rS.buscarPorPrioridad(this.prioridadSeleccionada).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para esta prioridad.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por prioridad:', error);
        this.dataSource.data = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
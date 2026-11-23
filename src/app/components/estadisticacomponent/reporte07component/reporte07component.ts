import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reporte07component',
  standalone: true,
  imports: [DatePipe, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTableModule],
  templateUrl: './reporte07component.html',
  styleUrl: './reporte07component.css',
})
export class Reporte07component {
  dataSource: ReporteDTOList[] = [];
  displayedColumns: string[] = ['idReporte', 'titulo', 'prioridad', 'estado', 'fechaCreacion'];
  prioridadSeleccionada = '';
  prioridades = [
    { value: 'ALTA', viewValue: 'Alta' },
    { value: 'MEDIA', viewValue: 'Media' },
    { value: 'BAJA', viewValue: 'Baja' },
  ];
  mensaje = '';

  constructor(
    private rS: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscar(): void {
    if (!this.prioridadSeleccionada) {
      this.dataSource = [];
      this.mensaje = 'Seleccione una prioridad.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.rS.buscarPorPrioridad(this.prioridadSeleccionada).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para esta prioridad.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por prioridad:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
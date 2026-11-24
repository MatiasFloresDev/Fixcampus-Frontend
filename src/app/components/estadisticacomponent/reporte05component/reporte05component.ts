import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reporte05component',
  standalone: true,
  imports: [DatePipe, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTableModule],
  templateUrl: './reporte05component.html',
  styleUrl: './reporte05component.css',
})
export class Reporte05component {
  dataSource: ReporteDTOList[] = [];
  displayedColumns: string[] = ['idReporte', 'titulo', 'prioridad', 'estado', 'fechaCreacion'];
  estadoSeleccionado = '';
  estados = [
    { value: 'PENDIENTE', viewValue: 'Pendiente' },{ value: 'ABIERTO', viewValue: 'ABIERTO' },{ value: 'EN_REVISION', viewValue: 'EN REVISION' },{ value: 'ASIGNADO', viewValue: 'ASIGNADO' },{ value: 'EN_ATENCION', viewValue: 'EN ATENCION' },{ value: 'CERRADO', viewValue: 'CERRADO' },
    { value: 'RESUELTO', viewValue: 'Resuelto' },
  ];
  mensaje = '';

  constructor(
    private rS: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscar(): void {
    if (!this.estadoSeleccionado) {
      this.dataSource = [];
      this.mensaje = 'Seleccione un estado.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.rS.buscarPorEstado(this.estadoSeleccionado).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para este estado.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por estado:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
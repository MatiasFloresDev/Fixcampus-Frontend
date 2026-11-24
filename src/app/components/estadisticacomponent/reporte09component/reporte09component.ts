import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOList } from '../../../models/RecomendacionDTOList';

@Component({
  selector: 'app-reporte09component',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './reporte09component.html',
  styleUrl: './reporte09component.css',
})
export class Reporte09component {
  dataSource: RecomendacionDTOList[] = [];
  displayedColumns: string[] = [
    'idRecomendacion',
    'reporteId',
    'tituloSugerido',
    'prioridadSugerida',
    'fechaRecomendacion',
  ];
  prioridad = '';
  mensaje = '';

  constructor(
    private recS: Recomendacionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscar(): void {
    const valor = this.prioridad.trim();
    if (!valor) {
      this.dataSource = [];
      this.mensaje = 'Ingrese una prioridad sugerida (por ejemplo: ALTA, MEDIA o BAJA).';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.recS.buscarPorPrioridad(valor).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje =
          data.length === 0 ? 'No se encontraron recomendaciones con esa prioridad.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar recomendaciones:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
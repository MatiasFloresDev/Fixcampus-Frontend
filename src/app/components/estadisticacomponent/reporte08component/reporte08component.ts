import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';

@Component({
  selector: 'app-reporte08component',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './reporte08component.html',
  styleUrl: './reporte08component.css',
})
export class Reporte08component {
  dataSource: ReporteDTOList[] = [];
  displayedColumns: string[] = ['idReporte', 'titulo', 'prioridad', 'estado', 'fechaCreacion'];
  correo = '';
  mensaje = '';

  constructor(
    private rS: Reporteservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscarPorCorreo(): void {
    const correoLimpio = this.correo.trim();
    if (!correoLimpio) {
      this.dataSource = [];
      this.mensaje = 'Ingrese un correo electrónico.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.rS.buscarPorCorreo(correoLimpio).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para ese correo.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por correo:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }

  cargarMisReportes(): void {
    this.mensaje = 'Cargando tus reportes...';
    this.dataSource = [];

    this.rS.misReportes().subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No tienes reportes registrados.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar mis reportes:', error);
        this.dataSource = [];
        this.mensaje = 'No se pudieron cargar tus reportes.';
        this.cdr.detectChanges();
      },
    });
  }
}
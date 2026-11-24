import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';

@Component({
  selector: 'app-reporte06component',
  standalone: true,
  imports: [DatePipe, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTableModule],
  templateUrl: './reporte06component.html',
  styleUrl: './reporte06component.css',
})
export class Reporte06component implements OnInit {
  dataSource: ReporteDTOList[] = [];
  categorias: CategoriaDTOList[] = [];
  displayedColumns: string[] = ['idReporte', 'titulo', 'prioridad', 'estado', 'fechaCreacion'];
  categoriaSeleccionada = '';
  mensaje = '';

  constructor(
    private rS: Reporteservice,
    private cS: Categoriaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cS.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar las categorías.';
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    if (!this.categoriaSeleccionada) {
      this.dataSource = [];
      this.mensaje = 'Seleccione una categoría.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.rS.buscarPorCategoria(this.categoriaSeleccionada).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para esta categoría.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por categoría:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';

@Component({
  selector: 'app-reporte06component',
  standalone: true,
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reporte06component.html',
  styleUrl: './reporte06component.css',
})
export class Reporte06component implements OnInit {
  dataSource = new MatTableDataSource<ReporteDTOList>([]);
  categorias: CategoriaDTOList[] = [];
  displayedColumns: string[] = ['titulo', 'prioridad', 'estado', 'fechaCreacion'];
  categoriaSeleccionada = '';
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

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
    this.dataSource.paginator?.firstPage();
    if (!this.categoriaSeleccionada) {
      this.dataSource.data = [];
      this.mensaje = 'Seleccione una categoría.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource.data = [];

    this.rS.buscarPorCategoria(this.categoriaSeleccionada).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para esta categoría.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por categoría:', error);
        this.dataSource.data = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
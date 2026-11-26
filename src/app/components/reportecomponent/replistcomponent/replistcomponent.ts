import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Loginservice } from '../../../services/loginservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';

@Component({
  selector: 'app-replistcomponent',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './replistcomponent.html',
  styleUrl: './replistcomponent.css',
})
export class Replistcomponent implements OnInit {
  displayedColumns: string[] = ['titulo', 'categoria', 'prioridad', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<ReporteDTOList>([]);
  categorias: CategoriaDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeCategorias = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private service: Reporteservice,
    private categoriaService: Categoriaservice,
    private loginService: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get puedeRegistrar(): boolean {
    return this.loginService.hasAnyRole(['ADMIN', 'REPORTANTE']);
  }

  ngOnInit(): void {
    this.listar();
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeCategorias = 'No se pudieron cargar los nombres de las categorías.';
        this.cdr.markForCheck();
      },
    });
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
        this.mensaje = 'No se pudieron cargar los reportes.';
        this.cdr.markForCheck();
      },
    });
  }

  nombreCategoria(id: number): string {
    const categoria = this.categorias.find((categoria) => categoria.idCategoria === id);
    return categoria?.nombre || 'Categoría no disponible';
  }

  eliminar(registro: ReporteDTOList): void {
    if (this.eliminando) {
      return;
    }
    const confirmado = confirm(
      '¿Eliminar este reporte y sus datos asociados? Esta acción no se puede deshacer.',
    );
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idReporte).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el reporte.';
        this.cdr.markForCheck();
      },
    });
  }
}
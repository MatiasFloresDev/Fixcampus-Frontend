import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Reporteservice } from '../../../services/reporteservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Loginservice } from '../../../services/loginservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-reporte08component',
  standalone: true,
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reporte08component.html',
  styleUrl: './reporte08component.css',
})
export class Reporte08component implements OnInit {
  dataSource = new MatTableDataSource<ReporteDTOList>([]);
  usuarios: UsuarioDTOList[] = [];
  displayedColumns: string[] = ['titulo', 'prioridad', 'estado', 'fechaCreacion'];
  correoSeleccionado = '';
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private rS: Reporteservice,
    private uS: Usuarioservice,
    private loginService: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    if (this.esAdmin) {
      this.uS.listar().subscribe({
        next: (data) => {
          this.usuarios = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.mensaje = 'No se pudieron cargar los usuarios.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  buscarPorCorreo(): void {
    this.dataSource.paginator?.firstPage();
    if (!this.correoSeleccionado) {
      this.dataSource.data = [];
      this.mensaje = 'Seleccione un correo electrónico.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource.data = [];

    this.rS.buscarPorCorreo(this.correoSeleccionado).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron reportes para ese correo.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar por correo:', error);
        this.dataSource.data = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }

  cargarMisReportes(): void {
    this.dataSource.paginator?.firstPage();
    this.mensaje = 'Cargando tus reportes...';
    this.dataSource.data = [];

    const consulta$ = this.loginService.hasAnyRole(['ADMIN', 'REPORTANTE'])
      ? this.rS.misReportes()
      : this.rS.buscarPorCorreo(this.loginService.getUsername());

    consulta$.subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje = data.length === 0 ? 'No tienes reportes registrados.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar mis reportes:', error);
        this.dataSource.data = [];
        this.mensaje = 'No se pudieron cargar tus reportes.';
        this.cdr.detectChanges();
      },
    });
  }
}

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-reporte10component',
  standalone: true,
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reporte10component.html',
  styleUrl: './reporte10component.css',
})
export class Reporte10component implements OnInit {
  dataSource = new MatTableDataSource<UsuarioDTOList>([]);
  nombres: string[] = [];
  displayedColumns: string[] = ['nombreCompleto', 'correo', 'estado', 'fechaRegistro'];
  nombreSeleccionado = '';
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private uS: Usuarioservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.uS.listar().subscribe({
      next: (data) => {
        this.nombres = Array.from(
          new Set(data.map((u) => u.nombre.trim()).filter(Boolean)),
        ).sort();
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los nombres de usuarios.';
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    this.dataSource.paginator?.firstPage();
    if (!this.nombreSeleccionado) {
      this.dataSource.data = [];
      this.mensaje = 'Seleccione un nombre para buscar.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource.data = [];

    this.uS.buscarPorNombre(this.nombreSeleccionado).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron usuarios con ese nombre.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar usuarios por nombre:', error);
        this.dataSource.data = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
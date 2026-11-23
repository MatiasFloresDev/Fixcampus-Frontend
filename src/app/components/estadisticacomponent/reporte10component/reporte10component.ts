import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-reporte10component',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './reporte10component.html',
  styleUrl: './reporte10component.css',
})
export class Reporte10component {
  dataSource: UsuarioDTOList[] = [];
  displayedColumns: string[] = ['idUsuario', 'nombreCompleto', 'correo', 'estado', 'fechaRegistro'];
  nombre = '';
  mensaje = '';

  constructor(
    private uS: Usuarioservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscar(): void {
    const valor = this.nombre.trim();
    if (!valor) {
      this.dataSource = [];
      this.mensaje = 'Ingrese un nombre para buscar.';
      return;
    }

    this.mensaje = 'Buscando...';
    this.dataSource = [];

    this.uS.buscarPorNombre(valor).subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.mensaje = data.length === 0 ? 'No se encontraron usuarios con ese nombre.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar usuarios por nombre:', error);
        this.dataSource = [];
        this.mensaje = 'Error al realizar la búsqueda.';
        this.cdr.detectChanges();
      },
    });
  }
}
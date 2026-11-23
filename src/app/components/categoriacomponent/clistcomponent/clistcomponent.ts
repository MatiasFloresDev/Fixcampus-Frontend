import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Categoriaservice } from '../../../services/categoriaservice';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';

@Component({
  selector: 'app-clistcomponent',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './clistcomponent.html',
  styleUrl: './clistcomponent.css',
})
export class Clistcomponent implements OnInit {
  displayedColumns: string[] = ['idCategoria', 'nombre', 'descripcion', 'acciones'];
  dataSource: CategoriaDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  constructor(
    private service: Categoriaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.service.listar().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje =
          error.status === 0
            ? 'No se pudo conectar con el servidor.'
            : 'No se pudieron cargar los registros.';
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(registro: CategoriaDTOList): void {
    if (this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idCategoria).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: (error) => {
        this.eliminando = false;
        this.mensaje =
          error.status === 404
            ? 'El registro ya no existe. Actualice el listado.'
            : 'No se pudo eliminar. Puede estar asociado a otros registros.';
        this.cdr.markForCheck();
      },
    });
  }
}

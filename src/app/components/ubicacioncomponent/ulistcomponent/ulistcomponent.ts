import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { UbicacionDTOList } from '../../../models/UbicacionDTOList';

@Component({
  selector: 'app-ulistcomponent',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './ulistcomponent.html',
  styleUrl: './ulistcomponent.css',
})
export class Ulistcomponent implements OnInit {
  displayedColumns: string[] = ['idUbicacion', 'campus', 'edificio', 'piso', 'tipo', 'acciones'];
  dataSource: UbicacionDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  constructor(
    private service: Ubicacionservice,
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

  eliminar(registro: UbicacionDTOList): void {
    if (this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar esta ubicación? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idUbicacion).subscribe({
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

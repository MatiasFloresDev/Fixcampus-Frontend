import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-rlistcomponent',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './rlistcomponent.html',
  styleUrl: './rlistcomponent.css',
})
export class Rlistcomponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'nivelAcceso', 'acciones'];
  dataSource = new MatTableDataSource<RolDTOList>([]);
  cargando = true;
  eliminando = false;
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private service: Rolservice,
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
        this.dataSource.data = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los registros.';
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(registro: RolDTOList): void {
    if (this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar este rol? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idRol).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el registro.';
        this.cdr.markForCheck();
      },
    });
  }
}
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { Loginservice } from '../../../services/loginservice';
import { UbicacionDTOList } from '../../../models/UbicacionDTOList';

@Component({
  selector: 'app-ulistcomponent',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './ulistcomponent.html',
  styleUrl: './ulistcomponent.css',
})
export class Ulistcomponent implements OnInit {
  displayedColumns: string[] = ['campus', 'edificio', 'piso', 'tipo', 'acciones'];
  dataSource = new MatTableDataSource<UbicacionDTOList>([]);
  cargando = true;
  eliminando = false;
  mensaje = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private service: Ubicacionservice,
    private loginService: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

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
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el registro.';
        this.cdr.markForCheck();
      },
    });
  }
}
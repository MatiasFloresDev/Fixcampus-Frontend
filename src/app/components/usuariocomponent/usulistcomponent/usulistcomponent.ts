import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-usulistcomponent',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './usulistcomponent.html',
  styleUrl: './usulistcomponent.css',
})
export class Usulistcomponent implements OnInit {
  displayedColumns: string[] = ['idUsuario', 'nombre', 'correo', 'rol', 'estado', 'acciones'];
  dataSource: UsuarioDTOList[] = [];
  roles: RolDTOList[] = [];
  mensajeRoles = '';
  cargando = true;
  eliminando = false;
  mensaje = '';
  constructor(
    private service: Usuarioservice,
    private rolService: Rolservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarRoles();
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

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeRoles = 'No se pudieron cargar los nombres de los roles.';
        this.cdr.markForCheck();
      },
    });
  }

  nombreRol(id: number): string {
    const rol = this.roles.find((rol) => rol.idRol === id);
    return rol?.nombre || 'Rol #' + id;
  }

  eliminar(registro: UsuarioDTOList): void {
    if (this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idUsuario).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: (error) => {
        this.eliminando = false;
        this.mensaje =
          error.status === 404
            ? 'El registro ya no existe. Actualice el listado.'
            : 'No se pudo eliminar el usuario. Puede estar asociado a otros registros.';
        this.cdr.markForCheck();
      },
    });
  }
}

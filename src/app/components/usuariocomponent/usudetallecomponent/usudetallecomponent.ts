import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-usudetallecomponent',
  standalone: true,
  imports: [DatePipe, MatButtonModule, RouterLink],
  templateUrl: './usudetallecomponent.html',
  styleUrl: './usudetallecomponent.css',
})
export class Usudetallecomponent implements OnInit {
  registro: UsuarioDTOList | null = null;
  rol: RolDTOList | null = null;
  mensajeRol = '';
  cargando = true;
  eliminando = false;
  mensaje = '';

  constructor(
    private service: Usuarioservice,
    private rolService: Rolservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del registro no es válido.';
      return;
    }
    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.registro = data;
        this.cargarRol(data.rolId);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje =
          error.status === 404 ? 'No se encontró el registro.' : 'No se pudo cargar el registro.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRol(id: number): void {
    this.rolService.buscarPorId(id).subscribe({
      next: (data) => {
        this.rol = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeRol = 'No se pudo cargar el nombre del rol.';
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(): void {
    if (!this.registro || this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idUsuario).subscribe({
      next: () => {
        this.router.navigate(['/usuarios/listar']);
      },
      error: (error) => {
        this.eliminando = false;
        this.mensaje =
          error.status === 404
            ? 'El registro ya no existe.'
            : 'No se pudo eliminar el usuario. Puede estar asociado a otros registros.';
        this.cdr.markForCheck();
      },
    });
  }
}

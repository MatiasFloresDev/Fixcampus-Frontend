import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Comentarioservice } from '../../../services/comentarioservice';
import { ComentarioDTOList } from '../../../models/ComentarioDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-comdetallecomponent',
  standalone: true,
  imports: [DatePipe, MatButtonModule, RouterLink],
  templateUrl: './comdetallecomponent.html',
  styleUrl: './comdetallecomponent.css',
})
export class Comdetallecomponent implements OnInit {
  registro: ComentarioDTOList | null = null;
  reporte: ReporteDTOList | null = null;
  usuarios: UsuarioDTOList[] = [];
  mensajeUsuarios = '';
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReporte = '';

  constructor(
    private service: Comentarioservice,
    private reporteService: Reporteservice,
    private usuarioService: Usuarioservice,
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
        this.cargando = false;
        this.cargarRelaciones(data.reporteId);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el comentario.';
        if (error.status === 404) this.mensaje = 'No se encontró el registro.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRelaciones(reporteId: number): void {
    this.reporteService.buscarPorId(reporteId).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReporte = 'No se pudo cargar el título del reporte.';
        this.cdr.markForCheck();
      },
    });
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeUsuarios = 'No se pudieron cargar los autores. Se mostrarán sus IDs.';
        this.cdr.markForCheck();
      },
    });
  }

  nombreUsuario(id: number): string {
    const usuario = this.usuarios.find((usuario) => usuario.idUsuario === id);
    if (!usuario) return 'Usuario #' + id;
    return usuario.nombre + ' ' + usuario.apellido;
  }

  eliminar(): void {
    if (!this.registro || this.eliminando) return;
    const confirmado = confirm('¿Eliminar este comentario? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idComentario).subscribe({
      next: () => {
        this.router.navigate(['/comentarios/listar']);
      },
      error: (error) => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el comentario.';
        if (error.status === 403) this.mensaje = 'No tiene permiso para eliminar este registro.';
        this.cdr.markForCheck();
      },
    });
  }
}

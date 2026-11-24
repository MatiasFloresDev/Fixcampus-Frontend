import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Comentarioservice } from '../../../services/comentarioservice';
import { ComentarioDTOList } from '../../../models/ComentarioDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-comlistcomponent',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './comlistcomponent.html',
  styleUrl: './comlistcomponent.css',
})
export class Comlistcomponent implements OnInit {
  displayedColumns: string[] = [
    'idComentario',
    'reporteId',
    'usuarioId',
    'textoComentario',
    'fechaComentario',
    'acciones',
  ];
  dataSource: ComentarioDTOList[] = [];
  reportes: ReporteDTOList[] = [];
  usuarios: UsuarioDTOList[] = [];
  mensajeUsuarios = '';
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReportes = '';

  constructor(
    private service: Comentarioservice,
    private reporteService: Reporteservice,
    private usuarioService: Usuarioservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarRelaciones();
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
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los registros de comentarios.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRelaciones(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReportes = 'No se pudieron cargar los títulos de los reportes.';
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

  nombreReporte(id: number): string {
    const reporte = this.reportes.find((reporte) => reporte.idReporte === id);
    if (!reporte) return 'Reporte #' + id;
    return '#' + id + ' · ' + reporte.titulo;
  }

  nombreUsuario(id: number): string {
    const usuario = this.usuarios.find((usuario) => usuario.idUsuario === id);
    if (!usuario) return 'Usuario #' + id;
    return usuario.nombre + ' ' + usuario.apellido;
  }

  eliminar(registro: ComentarioDTOList): void {
    if (this.eliminando) return;
    const confirmado = confirm('¿Eliminar este comentario? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idComentario).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
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

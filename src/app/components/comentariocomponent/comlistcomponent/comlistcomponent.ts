import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Comentarioservice } from '../../../services/comentarioservice';
import { ComentarioDTOList } from '../../../models/ComentarioDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-comlistcomponent',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  templateUrl: './comlistcomponent.html',
  styleUrl: './comlistcomponent.css',
})
export class Comlistcomponent implements OnInit {
  dataSource = new MatTableDataSource<ComentarioDTOList>([]);
  reportes: ReporteDTOList[] = [];
  usuarios: UsuarioDTOList[] = [];
  mensajeUsuarios = '';
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReportes = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private service: Comentarioservice,
    private reporteService: Reporteservice,
    private usuarioService: Usuarioservice,
    private loginService: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get displayedColumns(): string[] {
    return this.esAdmin
      ? ['idComentario', 'reporteId', 'usuarioId', 'textoComentario', 'fechaComentario', 'acciones']
      : ['idComentario', 'reporteId', 'textoComentario', 'fechaComentario', 'acciones'];
  }

  ngOnInit(): void {
    this.listar();
    this.cargarRelaciones();
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

    if (this.esAdmin) {
      this.usuarioService.listar().subscribe({
        next: (data) => {
          this.usuarios = data;
          this.cdr.markForCheck();
        },
        error: () => {
          this.mensajeUsuarios = 'No se pudieron cargar los autores.';
          this.cdr.markForCheck();
        },
      });
    }
  }

  nombreReporte(id: number): string {
    const reporte = this.reportes.find((reporte) => reporte.idReporte === id);
    return reporte ? reporte.titulo : 'Reporte no disponible';
  }

  nombreUsuario(id: number): string {
    const usuario = this.usuarios.find((usuario) => usuario.idUsuario === id);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'No disponible';
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
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el comentario.';
        this.cdr.markForCheck();
      },
    });
  }
}
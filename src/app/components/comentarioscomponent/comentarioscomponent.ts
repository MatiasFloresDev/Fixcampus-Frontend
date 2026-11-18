import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ComentarioDTO } from '../../models/ComentarioDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Comentarioservice } from '../../services/comentarioservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  selector: 'app-comentarioscomponent',
  imports: [DatePipe, RouterLink, MatButtonModule, MatPaginatorModule],
  templateUrl: './comentarioscomponent.html',
  styleUrl: './comentarioscomponent.css',
})
export class Comentarioscomponent implements OnInit {
  reporteId: number;
  reporte: ReporteDTO | null = null;
  comentarios: ComentarioDTO[] = [];
  paginaComentarios = 0;
  porPaginaComentarios = 5;
  pendiente: {
    tipo: 'comentario' | 'recomendacion';
    id: number;
  } | null = null;
  cargando = false;
  guardando = false;
  error = '';
  aviso = '';

  constructor(
    private acceso: Accesoservice,
    private comentariosApi: Comentarioservice,
    private reportesApi: Reporteservice,
    private ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.reporteId = Number(this.ruta.parent?.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargar();
  }
  guardarBloqueado(): boolean {
    return this.guardando || this.cargando || !this.reporte || !!this.pendiente;
  }
  private falloOperacion(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo completar la operación.');
    this.guardando = false;
    this.cdr.detectChanges();
  }
  private mostrarError(error: HttpErrorResponse, respaldo: string): void {
    this.acceso.revisarError(error);
    this.error =
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : respaldo;
  }
  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el seguimiento.');
    this.cargando = false;
    this.cdr.detectChanges();
  }
  comentariosVisibles(): ComentarioDTO[] {
    return this.comentarios.slice(
      this.paginaComentarios * this.porPaginaComentarios,
      (this.paginaComentarios + 1) * this.porPaginaComentarios,
    );
  }
  cambiarPaginaComentarios(evento: PageEvent): void {
    this.paginaComentarios = evento.pageIndex;
    this.porPaginaComentarios = evento.pageSize;
  }
  cargar(): void {
    if (!Number.isSafeInteger(this.reporteId) || this.reporteId < 1) {
      this.error = 'El número de reporte no es válido.';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.reportesApi.obtener(this.reporteId).subscribe({
      next: (reporte) => {
        this.reporte = reporte;
        this.cargarComentarios();
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }
  private cargarComentarios(): void {
    this.comentariosApi.listar(this.reporteId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }
  eliminar(): void {
    const pendiente = this.pendiente;
    if (!pendiente || this.guardando) return;
    this.guardando = true;
    this.error = '';
    this.aviso = '';

    this.comentariosApi.eliminar(pendiente.id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter((item) => item.idComentario !== pendiente.id);
        this.paginaComentarios = Math.min(
          this.paginaComentarios,
          Math.max(0, Math.ceil(this.comentarios.length / this.porPaginaComentarios) - 1),
        );
        this.pendiente = null;
        this.aviso = 'Se eliminó el comentario.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloOperacion(error);
      },
    });
  }
}

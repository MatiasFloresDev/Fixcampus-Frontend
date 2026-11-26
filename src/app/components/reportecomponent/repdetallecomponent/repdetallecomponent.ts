import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comentariosreportecomponent } from '../../comentariocomponent/comentariosreportecomponent/comentariosreportecomponent';
import { Adjuntosreportecomponent } from '../../adjuntocomponent/adjuntosreportecomponent/adjuntosreportecomponent';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Loginservice } from '../../../services/loginservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';
import { UbicacionDTOList } from '../../../models/UbicacionDTOList';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-repdetallecomponent',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    Comentariosreportecomponent,
    Adjuntosreportecomponent,
  ],
  templateUrl: './repdetallecomponent.html',
  styleUrl: './repdetallecomponent.css',
})
export class Repdetallecomponent implements OnInit {
  registro: ReporteDTOList | null = null;
  categoria: CategoriaDTOList | null = null;
  ubicacion: UbicacionDTOList | null = null;
  usuarios: UsuarioDTOList[] = [];
  cargando = true;
  eliminando = false;
  comentarioEnProceso = false;
  mensaje = '';
  mensajeRelaciones = '';

  constructor(
    private service: Reporteservice,
    private categoriaService: Categoriaservice,
    private ubicacionService: Ubicacionservice,
    private usuarioService: Usuarioservice,
    private loginService: Loginservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del reporte no es válido.';
      return;
    }
    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.registro = data;
        this.cargando = false;
        this.cargarRelaciones(data);
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el reporte.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRelaciones(reporte: ReporteDTOList): void {
    this.categoriaService.buscarPorId(reporte.categoriaId).subscribe({
      next: (data) => {
        this.categoria = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeRelaciones = 'No se pudo cargar el nombre de la categoría.';
        this.cdr.markForCheck();
      },
    });
    this.ubicacionService.buscarPorId(reporte.ubicacionId).subscribe({
      next: (data) => {
        this.ubicacion = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeRelaciones = 'No se pudo cargar la descripción de la ubicación.';
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
          this.mensajeRelaciones = 'No se pudieron cargar los nombres de los usuarios.';
          this.cdr.markForCheck();
        },
      });
    }
  }

  nombreUsuario(id: number): string {
    const usuario = this.usuarios.find((usuario) => usuario.idUsuario === id);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'No disponible';
  }

  eliminar(): void {
    if (!this.registro || this.eliminando || this.comentarioEnProceso) {
      return;
    }
    const confirmado = confirm(
      '¿Eliminar este reporte y sus datos asociados? Esta acción no se puede deshacer.',
    );
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idReporte).subscribe({
      next: () => {
        this.router.navigate(['/reportes/listar']);
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el reporte.';
        this.cdr.markForCheck();
      },
    });
  }
}
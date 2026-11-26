import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Adjuntoservice } from '../../../services/adjuntoservice';
import { AdjuntoDTOList } from '../../../models/AdjuntoDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-adjdetallecomponent',
  standalone: true,
  imports: [DatePipe, MatButtonModule, RouterLink],
  templateUrl: './adjdetallecomponent.html',
  styleUrl: './adjdetallecomponent.css',
})
export class Adjdetallecomponent implements OnInit {
  registro: AdjuntoDTOList | null = null;
  reporte: ReporteDTOList | null = null;
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReporte = '';

  constructor(
    private service: Adjuntoservice,
    private reporteService: Reporteservice,
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
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el adjunto.';
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
  }

  eliminar(): void {
    if (!this.registro || this.eliminando) return;
    const confirmado = confirm('¿Eliminar este adjunto? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idAdjunto).subscribe({
      next: () => {
        this.router.navigate(['/adjuntos/listar']);
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el adjunto.';
        this.cdr.markForCheck();
      },
    });
  }
}
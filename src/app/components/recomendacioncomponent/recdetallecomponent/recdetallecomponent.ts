import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOList } from '../../../models/RecomendacionDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-recdetallecomponent',
  standalone: true,
  imports: [DatePipe, MatButtonModule, RouterLink],
  templateUrl: './recdetallecomponent.html',
  styleUrl: './recdetallecomponent.css',
})
export class Recdetallecomponent implements OnInit {
  registro: RecomendacionDTOList | null = null;
  reporte: ReporteDTOList | null = null;
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReporte = '';

  constructor(
    private service: Recomendacionservice,
    private reporteService: Reporteservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private loginService: Loginservice,
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
        this.mensaje = 'No se pudo cargar la recomendación.';
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
    const confirmado = confirm('¿Eliminar esta recomendación? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idRecomendacion).subscribe({
      next: () => {
        this.router.navigate(['/recomendaciones/listar']);
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar la recomendación.';
        this.cdr.markForCheck();
      },
    });
  }
}

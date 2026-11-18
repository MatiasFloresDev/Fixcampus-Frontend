import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';
import { Evidenciascomponent } from '../evidenciascomponent/evidenciascomponent';
@Component({
  selector: 'app-reportedetallecomponent',
  imports: [DatePipe, RouterLink, MatButtonModule, Evidenciascomponent],
  templateUrl: './reportedetallecomponent.html',
  styleUrl: './reportedetallecomponent.css',
})
export class Reportedetallecomponent implements OnInit {
  reporte?: ReporteDTO;
  confirmacionEliminar?: ReporteDTO;
  cargando = true;
  eliminando = false;
  error = '';
  errorEliminar = '';
  constructor(
    public acceso: Accesoservice,
    private servicio: Reporteservice,
    private ruta: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (this.acceso.validarSesion()) this.cargar();
  }
  cargar(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id < 1) {
      this.error = 'El número de reporte no es válido.';
      this.cargando = false;
      return;
    }
    this.cargando = true;
    this.error = '';
    this.servicio.obtener(id).subscribe({
      next: (datos) => {
        this.reporte = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error =
          error.status === 404
            ? 'El reporte ya no existe.'
            : error.status === 403
              ? 'No tienes permiso para ver este reporte.'
              : 'No se pudo consultar el reporte.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
  eliminarReporte(): void {
    if (!this.confirmacionEliminar || this.eliminando || this.acceso.rol() !== 'ADMIN') return;
    this.eliminando = true;
    this.errorEliminar = '';
    this.servicio.eliminar(this.confirmacionEliminar.idReporte).subscribe({
      next: () => {
        this.router.navigate(['/evidencias']);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.errorEliminar =
          error.status === 409
            ? 'El reporte tiene comentarios, recomendaciones o evidencias. Retíralos antes de eliminarlo.'
            : 'No se pudo eliminar el reporte.';
        this.eliminando = false;
        this.cdr.detectChanges();
      },
    });
  }
}

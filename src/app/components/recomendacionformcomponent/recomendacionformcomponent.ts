import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { RecomendacionDTO } from '../../models/RecomendacionDTO';
import { RecomendacionFormularioDTO } from '../../models/RecomendacionFormularioDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Recomendacionservice } from '../../services/recomendacionservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  selector: 'app-recomendacionformcomponent',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './recomendacionformcomponent.html',
  styleUrl: './recomendacionformcomponent.css',
})
export class Recomendacionformcomponent implements OnInit {
  reporteId: number;
  reporte: ReporteDTO | null = null;
  recomendacion: RecomendacionDTO | null = null;
  pendiente: {
    tipo: 'comentario' | 'recomendacion';
    id: number;
  } | null = null;
  cargando = false;
  guardando = false;
  error = '';
  aviso = '';
  prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  private texto = [Validators.required, Validators.pattern(/\S/)];
  recomendacionForm: FormGroup;

  constructor(
    private acceso: Accesoservice,
    private recomendacionesApi: Recomendacionservice,
    private reportesApi: Reporteservice,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.reporteId = Number(this.ruta.parent?.snapshot.paramMap.get('id'));
    this.recomendacionForm = this.fb.group({
      tituloSugerido: ['', [...this.texto, Validators.maxLength(200)]],
      resumen: ['', this.texto],
      prioridadSugerida: [
        'MEDIA',
        [Validators.required, Validators.pattern(/^(MUY_BAJA|BAJA|MEDIA|ALTA|MUY_ALTA)$/)],
      ],
      justificacion: ['', this.texto],
    });
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
  guardarRecomendacion(): void {
    this.recomendacionForm.markAllAsTouched();
    if (this.guardarBloqueado() || this.recomendacionForm.invalid) return;
    const valores = this.recomendacionForm.getRawValue();
    const datos = new RecomendacionFormularioDTO();
    datos.reporteId = this.reporteId;
    datos.tituloSugerido = valores.tituloSugerido.trim();
    datos.resumen = valores.resumen.trim();
    datos.prioridadSugerida = valores.prioridadSugerida;
    datos.justificacion = valores.justificacion.trim();
    const id = this.recomendacion?.idRecomendacion;
    const peticion = id
      ? this.recomendacionesApi.actualizar(id, datos)
      : this.recomendacionesApi.registrar(datos);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    peticion.subscribe({
      next: (recomendacion) => {
        this.recomendacion = recomendacion;
        this.aviso = 'Se guardó la recomendación.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloOperacion(error);
      },
    });
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
        this.cargarRecomendacion();
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }
  private cargarRecomendacion(): void {
    this.recomendacionesApi.porReporte(this.reporteId).subscribe({
      next: (recomendacion) => {
        this.recomendacion = recomendacion;
        this.recomendacionForm.reset(
          recomendacion ?? {
            tituloSugerido: '',
            resumen: '',
            prioridadSugerida: 'MEDIA',
            justificacion: '',
          },
        );
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

    this.recomendacionesApi.eliminar(pendiente.id).subscribe({
      next: () => {
        this.recomendacion = null;
        this.recomendacionForm.reset({
          tituloSugerido: '',
          resumen: '',
          prioridadSugerida: 'MEDIA',
          justificacion: '',
        });
        this.pendiente = null;
        this.aviso = 'Se eliminó la recomendación.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloOperacion(error);
      },
    });
  }
}

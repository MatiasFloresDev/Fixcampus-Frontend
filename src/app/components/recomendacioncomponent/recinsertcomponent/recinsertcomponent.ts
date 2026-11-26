import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOInsert } from '../../../models/RecomendacionDTOInsert';
import { Iarecomendacionservice } from '../../../services/iarecomendacionservice';

@Component({
  selector: 'app-recinsertcomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './recinsertcomponent.html',
  styleUrl: './recinsertcomponent.css',
})
export class Recinsertcomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  generandoIA = false;
  mensaje = '';
  reportes: ReporteDTOList[] = [];
  reportesCargados = false;
  mensajeReportes = '';
  prioridades = [
    { value: 'ALTA', viewValue: 'Alta' },
    { value: 'MEDIA', viewValue: 'Media' },
    { value: 'BAJA', viewValue: 'Baja' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: Recomendacionservice,
    private reporteService: Reporteservice,
    private iaService: Iarecomendacionservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      reporteId: [null as number | null, Validators.required],
      tituloSugerido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      resumen: ['', [Validators.required, Validators.pattern(/\S/)]],
      prioridadSugerida: ['', Validators.required],
      justificacion: ['', [Validators.required, Validators.pattern(/\S/)]],
    });
  }

  ngOnInit(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.reportesCargados = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReportes = 'No se pudieron cargar los reportes.';
        this.cdr.markForCheck();
      },
    });
  }

  sugerirConIA(): void {
    const reporteId = this.form.value.reporteId;
    const reporte = this.reportes.find((r) => r.idReporte === reporteId);
    if (!reporte || this.generandoIA) return;

    this.generandoIA = true;
    this.mensaje = '';
    this.iaService.generarSugerencia(reporte.titulo, reporte.descripcion).subscribe({
      next: (sugerencia) => {
        this.form.patchValue({
          tituloSugerido: sugerencia.tituloSugerido,
          resumen: sugerencia.resumen,
          prioridadSugerida: sugerencia.prioridadSugerida?.toUpperCase() || 'MEDIA',
          justificacion: sugerencia.justificacion,
        });
        this.generandoIA = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.generandoIA = false;
        this.mensaje =
          'No se pudo generar la recomendación con IA. Verifique su API Key o complete manualmente.';
        this.cdr.markForCheck();
      },
    });
  }

  guardar(): void {
    if (this.guardando || !this.reportesCargados) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: RecomendacionDTOInsert = {
      reporteId: this.form.value.reporteId,
      tituloSugerido: this.form.value.tituloSugerido.trim(),
      resumen: this.form.value.resumen.trim(),
      prioridadSugerida: this.form.value.prioridadSugerida,
      justificacion: this.form.value.justificacion.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/recomendaciones/listar']);
      },
      error: (error) => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar la recomendación.';
        if (error.error?.message === 'Este reporte ya tiene una recomendación') {
          this.mensaje = 'Este reporte ya tiene una recomendación. Puede editar la existente.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}
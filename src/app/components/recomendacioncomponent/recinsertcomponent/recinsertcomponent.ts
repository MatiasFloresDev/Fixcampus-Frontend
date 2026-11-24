import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOInsert } from '../../../models/RecomendacionDTOInsert';

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
  ],
  templateUrl: './recinsertcomponent.html',
  styleUrl: './recinsertcomponent.css',
})
export class Recinsertcomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  reportes: ReporteDTOList[] = [];
  reportesCargados = false;
  mensajeReportes = '';

  constructor(
    private fb: FormBuilder,
    private service: Recomendacionservice,
    private reporteService: Reporteservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      reporteId: [null as number | null, Validators.required],
      tituloSugerido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      resumen: ['', [Validators.required, Validators.pattern(/\S/)]],
      prioridadSugerida: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(30)]],
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
      prioridadSugerida: this.form.value.prioridadSugerida.trim(),
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
        if (error.status === 403) this.mensaje = 'No tiene permiso para guardar este registro.';
        if (error.error?.message === 'Este reporte ya tiene una recomendación') {
          this.mensaje = 'Este reporte ya tiene una recomendación. Puede editar la existente.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}

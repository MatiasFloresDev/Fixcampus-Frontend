import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Adjuntoservice } from '../../../services/adjuntoservice';
import { AdjuntoDTOInsert } from '../../../models/AdjuntoDTOInsert';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-adjinsertcomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './adjinsertcomponent.html',
  styleUrl: './adjinsertcomponent.css',
})
export class Adjinsertcomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  reportes: ReporteDTOList[] = [];
  reportesCargados = false;
  mensajeReportes = '';

  constructor(
    private fb: FormBuilder,
    private service: Adjuntoservice,
    private reporteService: Reporteservice,
    private loginService: Loginservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      reporteId: [null as number | null, Validators.required],
      nombreArchivo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
      urlArchivo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
      tipoArchivo: ['', [Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    const consulta$ = this.loginService.hasAnyRole(['ADMIN'])
      ? this.reporteService.listar()
      : this.reporteService.misReportes();

    consulta$.subscribe({
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
    const dto: AdjuntoDTOInsert = {
      reporteId: this.form.value.reporteId,
      nombreArchivo: this.form.value.nombreArchivo.trim(),
      urlArchivo: this.form.value.urlArchivo.trim(),
      tipoArchivo: this.form.value.tipoArchivo?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/adjuntos/listar']);
      },
      error: (error) => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el adjunto.';
        if (error.error?.message === 'Un reporte puede tener como máximo 3 evidencias') {
          this.mensaje = 'Este reporte ya tiene tres adjuntos. No se pueden registrar más.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}

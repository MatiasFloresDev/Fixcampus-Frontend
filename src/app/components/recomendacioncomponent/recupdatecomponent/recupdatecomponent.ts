import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOUpdate } from '../../../models/RecomendacionDTOUpdate';

@Component({
  selector: 'app-recupdatecomponent',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './recupdatecomponent.html',
  styleUrl: './recupdatecomponent.css',
})
export class Recupdatecomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  id = 0;
  cargando = true;
  encontrado = false;

  constructor(
    private fb: FormBuilder,
    private service: Recomendacionservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      tituloSugerido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      resumen: ['', [Validators.required, Validators.pattern(/\S/)]],
      prioridadSugerida: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(30)]],
      justificacion: ['', [Validators.required, Validators.pattern(/\S/)]],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del registro no es válido.';
      return;
    }
    this.service.buscarPorId(this.id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.encontrado = true;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar la recomendación.';
        this.cdr.markForCheck();
      },
    });
  }

  guardar(): void {
    if (this.guardando || !this.encontrado) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: RecomendacionDTOUpdate = {
      tituloSugerido: this.form.value.tituloSugerido.trim(),
      resumen: this.form.value.resumen.trim(),
      prioridadSugerida: this.form.value.prioridadSugerida.trim(),
      justificacion: this.form.value.justificacion.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
      next: () => {
        this.router.navigate(['/recomendaciones/listar']);
      },
      error: (error) => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar la recomendación.';
        if (error.status === 403) this.mensaje = 'No tiene permiso para guardar este registro.';
        this.cdr.markForCheck();
      },
    });
  }
}
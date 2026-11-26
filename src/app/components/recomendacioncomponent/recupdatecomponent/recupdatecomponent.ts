import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Recomendacionservice } from '../../../services/recomendacionservice';
import { RecomendacionDTOUpdate } from '../../../models/RecomendacionDTOUpdate';

@Component({
  selector: 'app-recupdatecomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
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
  prioridades = [
    { value: 'ALTA', viewValue: 'Alta' },
    { value: 'MEDIA', viewValue: 'Media' },
    { value: 'BAJA', viewValue: 'Baja' },
  ];

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
      prioridadSugerida: ['', Validators.required],
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
        this.form.patchValue({
          ...data,
          prioridadSugerida: data.prioridadSugerida?.trim().toUpperCase() || '',
        });
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
      prioridadSugerida: this.form.value.prioridadSugerida,
      justificacion: this.form.value.justificacion.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
      next: () => {
        this.router.navigate(['/recomendaciones/listar']);
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar la recomendación.';
        this.cdr.markForCheck();
      },
    });
  }
}
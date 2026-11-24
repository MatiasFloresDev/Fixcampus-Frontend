import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { UbicacionDTOInsert } from '../../../models/UbicacionDTOInsert';

@Component({
  selector: 'app-uinsertcomponent',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, RouterLink],
  templateUrl: './uinsertcomponent.html',
  styleUrl: './uinsertcomponent.css',
})
export class Uinsertcomponent {
  form: FormGroup;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private service: Ubicacionservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      latitud: [null, [Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.min(-180), Validators.max(180)]],
      campus: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      edificio: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      piso: [null as number | null],
      zona: ['', [Validators.maxLength(150)]],
      tipo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
    });
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    if ((this.form.value.latitud === null) !== (this.form.value.longitud === null)) {
      this.mensaje = 'Completa latitud y longitud juntas o deja ambas vacías.';
      return;
    }
    const dto: UbicacionDTOInsert = {
      latitud: this.form.value.latitud ?? null,
      longitud: this.form.value.longitud ?? null,
      campus: this.form.value.campus.trim(),
      edificio: this.form.value.edificio.trim(),
      piso: this.form.value.piso ?? null,
      zona: this.form.value.zona?.trim() || null,
      tipo: this.form.value.tipo.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/ubicaciones/listar']);
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar la ubicación.';
        this.cdr.markForCheck();
      },
    });
  }
}

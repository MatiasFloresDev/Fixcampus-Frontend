import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';

@Component({
  selector: 'app-rinsertcomponent',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, RouterLink],
  templateUrl: './rinsertcomponent.html',
  styleUrl: './rinsertcomponent.css',
})
export class Rinsertcomponent {
  form: FormGroup;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private service: Rolservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      nivelAcceso: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
    });
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: RolDTOInsert = {
      nombre: this.form.value.nombre.trim(),
      nivelAcceso: this.form.value.nivelAcceso.trim(),
      descripcion: this.form.value.descripcion?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/roles/listar']);
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el rol.';
        this.cdr.markForCheck();
      },
    });
  }
}

import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Categoriaservice } from '../../../services/categoriaservice';
import { CategoriaDTOInsert } from '../../../models/CategoriaDTOInsert';

@Component({
  selector: 'app-cinsertcomponent',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, RouterLink],
  templateUrl: './cinsertcomponent.html',
  styleUrl: './cinsertcomponent.css',
})
export class Cinsertcomponent {
  form: FormGroup;
  guardando = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private service: Categoriaservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
    });
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: CategoriaDTOInsert = {
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/categorias/listar']);
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar la categoría.';
        this.cdr.markForCheck();
      },
    });
  }
}

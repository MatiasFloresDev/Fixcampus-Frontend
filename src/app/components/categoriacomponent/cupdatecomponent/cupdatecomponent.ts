import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Categoriaservice } from '../../../services/categoriaservice';
import { CategoriaDTOInsert } from '../../../models/CategoriaDTOInsert';

@Component({
  selector: 'app-cupdatecomponent',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, RouterLink],
  templateUrl: './cupdatecomponent.html',
  styleUrl: './cupdatecomponent.css',
})
export class Cupdatecomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  id = 0;
  cargando = true;
  encontrado = false;

  constructor(
    private fb: FormBuilder,
    private service: Categoriaservice,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
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
      error: (error) => {
        this.cargando = false;
        this.mensaje =
          error.status === 404 ? 'No se encontró el registro.' : 'No se pudo cargar el registro.';
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
    const dto: CategoriaDTOInsert = {
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
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

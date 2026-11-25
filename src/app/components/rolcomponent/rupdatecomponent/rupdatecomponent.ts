import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOInsert } from '../../../models/RolDTOInsert';

@Component({
  selector: 'app-rupdatecomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './rupdatecomponent.html',
  styleUrl: './rupdatecomponent.css',
})
export class Rupdatecomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  id = 0;
  cargando = true;
  encontrado = false;
  nivelesAcceso = [
    { value: 'TOTAL', viewValue: 'Total' },
    { value: 'INTERMEDIO', viewValue: 'Intermedio' },
    { value: 'BASICO', viewValue: 'Básico' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: Rolservice,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      nivelAcceso: ['', Validators.required],
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
        this.form.patchValue({
          ...data,
          nivelAcceso: data.nivelAcceso?.trim().toUpperCase() || '',
        });
        this.encontrado = true;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el registro.';
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
    const dto: RolDTOInsert = {
      nombre: this.form.value.nombre.trim(),
      nivelAcceso: this.form.value.nivelAcceso,
      descripcion: this.form.value.descripcion?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
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
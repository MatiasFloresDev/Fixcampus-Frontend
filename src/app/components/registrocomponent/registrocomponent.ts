import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Accesoservice } from '../../services/accesoservice';

@Component({
  selector: 'app-registrocomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.css',
})
export class Registrocomponent {
  formulario: FormGroup;
  cargando = false;
  correoRegistrado = '';
  mensaje = '';

  constructor(
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
    fb: FormBuilder,
  ) {
    this.formulario = fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/\S/)]],
      terminos: [false, Validators.requiredTrue],
    });
  }

  registrar(): void {
    if (this.formulario.invalid || this.cargando || this.correoRegistrado) return;
    const { nombre, apellido, correo, password } = this.formulario.getRawValue();
    this.cargando = true;
    this.mensaje = '';
    this.acceso
      .registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        password,
      })
      .subscribe({
        next: () => {
          this.correoRegistrado = correo.trim();
          this.formulario.reset({
            nombre: '',
            apellido: '',
            correo: '',
            password: '',
            terminos: false,
          });
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.cargando = false;
          const correoRepetido =
            error.status === 409 || error.error?.message === 'El correo ya está registrado';
          this.mensaje = correoRepetido
            ? 'Ya hay una cuenta con ese correo.'
            : error.status === 400
              ? 'Revisa los datos del formulario.'
              : 'No se pudo crear la cuenta. Inténtalo de nuevo.';
          this.cdr.detectChanges();
        },
      });
  }
}

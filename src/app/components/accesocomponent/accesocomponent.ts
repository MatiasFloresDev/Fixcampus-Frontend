import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Accesoservice } from '../../services/accesoservice';

@Component({
  selector: 'app-accesocomponent',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './accesocomponent.html',
  styleUrl: './accesocomponent.css',
})
export class Accesocomponent {
  formulario: FormGroup;
  cargando = false;
  mensaje = '';
  mostrarClave = false;

  constructor(
    public acceso: Accesoservice,
    private router: Router,
    public ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    fb: FormBuilder,
  ) {
    this.formulario = fb.group({
      correo: [
        ruta.snapshot.queryParamMap.get('correo') ?? '',
        [Validators.required, Validators.email],
      ],
      password: ['', Validators.required],
    });
  }

  ingresar(): void {
    if (this.formulario.invalid || this.cargando) return;
    this.cargando = true;
    this.mensaje = '';
    const datos = this.formulario.getRawValue();
    this.acceso.ingresar(datos.correo.trim(), datos.password).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.formulario.controls['password'].reset('');
        if (this.acceso.guardarToken(respuesta.token)) {
          this.router.navigate(['/panel']);
        } else {
          this.mensaje = 'No se pudo iniciar la sesión. Vuelve a intentarlo.';
          this.cdr.detectChanges();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mensaje =
          error.status === 401
            ? 'El correo o la contraseña no son correctos.'
            : 'No se pudo iniciar sesión. Revisa la conexión e inténtalo de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}

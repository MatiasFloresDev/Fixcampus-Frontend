import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Accesoservice } from '../../services/accesoservice';

@Component({
  selector: 'app-accesocomponent',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './accesocomponent.html',
  styleUrl: './accesocomponent.css',
})
export class Accesocomponent {
  correo = '';
  password = '';
  cargando = false;
  mensaje = '';
  constructor(
    private acceso: Accesoservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ingresar(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.mensaje = '';
    this.acceso.ingresar(this.correo.trim(), this.password).subscribe({
      next: (data) => {
        this.acceso.guardarToken(data.token);
        this.password = '';
        this.cargando = false;
        this.router.navigate(['/categorias/listar']);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.password = '';
        this.mensaje =
          error.status === 401
            ? 'El correo o la contraseña no son correctos.'
            : 'No se pudo iniciar sesión. Revisa la conexión e inténtalo de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}

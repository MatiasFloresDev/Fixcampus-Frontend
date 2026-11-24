import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Loginservice } from '../../services/loginservice';
import { LoginRequestDTO } from '../../models/LoginRequestDTO';

@Component({
  selector: 'app-logincomponent',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  form: FormGroup;
  errorMessage = '';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: Loginservice,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    const datos = new LoginRequestDTO();
    datos.correo = this.form.value.correo;
    datos.contrasena = this.form.value.contrasena;
    this.auth.login(datos).subscribe({
      next: () => {
        this.submitting = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination =
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/login'
            ? returnUrl
            : '/';

        void this.router.navigateByUrl(destination);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage =
          'No se pudo iniciar sesión. Verifica tu correo y contraseña e inténtalo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-logincomponent',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
  });

  errorMessage = '';
  submitting = false;

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination =
          returnUrl?.startsWith('/') &&
          !returnUrl.startsWith('//') &&
          returnUrl !== '/login' &&
          returnUrl !== '/'
            ? returnUrl
            : '/home';

        void this.router.navigateByUrl(destination);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage =
          'No se pudo iniciar sesión. Verifica tu correo y contraseña e inténtalo nuevamente.';
      },
    });
  }
}

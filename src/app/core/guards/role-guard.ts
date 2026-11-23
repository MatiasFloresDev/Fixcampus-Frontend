import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Loginservice);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const allowedRoles = route.data['roles'];
  if (!Array.isArray(allowedRoles) || !auth.hasAnyRole(allowedRoles)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
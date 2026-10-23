import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.token()) return true;
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.token()) return true;
  return inject(Router).createUrlTree(['/inicio']);
};

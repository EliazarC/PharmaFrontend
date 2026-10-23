import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const loginUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth/login`;
      const esLogin = req.url.replace(/\/$/, '') === loginUrl;
      if (err.status === 401 && !esLogin && auth.sesion()) {
        auth.cerrarSesion('expirada', router.url);
      }
      // Un 403 conserva la sesión: el componente muestra el mensaje del backend.
      return throwError(() => err);
    }),
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const urlApi = environment.apiUrl.replace(/\/$/, '');
  const esApi = req.url === urlApi || req.url.startsWith(`${urlApi}/`);
  if (!token || !esApi) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

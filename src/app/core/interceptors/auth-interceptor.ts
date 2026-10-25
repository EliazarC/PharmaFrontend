import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const urlApi = environment.apiUrl.replace(/\/$/, '');
  const esApi = req.url === urlApi || req.url.startsWith(`${urlApi}/`);
  // El login nunca lleva token: así no viaja uno anterior (vencido o de otro usuario).
  const esLogin = req.url.replace(/\/$/, '') === `${urlApi}/auth/login`;
  if (!esApi || esLogin) return next(req);
  const token = auth.token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

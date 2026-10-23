import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion } from './auth.model';

const CLAVE_SESION = 'pharmasoft.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;
  private readonly sesionActual = signal<Sesion | null>(this.leerSesionGuardada());
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly sesion = this.sesionActual.asReadonly();
  readonly autenticado = computed(() => this.token() !== null);

  constructor() {
    const sesion = this.sesionActual();
    if (sesion) this.programarExpiracion(sesion);
  }

  login(credenciales: LoginRequest): Observable<Sesion> {
    return this.http.post<LoginResponse>(`${this.url}/login`, credenciales).pipe(
      map(respuesta => {
        if (!respuesta?.token || !Number.isFinite(respuesta.expiraEnSegundos) ||
            respuesta.expiraEnSegundos <= 0) {
          throw new Error('El backend devolvió una respuesta de inicio de sesión inválida.');
        }
        return {
          token: respuesta.token,
          expiraEn: Date.now() + respuesta.expiraEnSegundos * 1000,
          username: respuesta.username,
          nombreCompleto: respuesta.nombreCompleto,
          roles: respuesta.roles ?? [],
          permisos: respuesta.permisos ?? [],
        } satisfies Sesion;
      }),
      tap(sesion => this.iniciar(sesion)),
    );
  }

  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = undefined;
    try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* almacenamiento no disponible */ }
    this.sesionActual.set(null);

    const queryParams: Record<string, string> = {};
    if (motivo === 'expirada') queryParams['expirada'] = '1';
    if (volverA && volverA.startsWith('/') && !volverA.startsWith('//') && volverA !== '/login') {
      queryParams['returnUrl'] = volverA;
    }
    void this.router.navigate(['/login'], { queryParams });
  }

  token(): string | null {
    const sesion = this.sesionActual();
    if (!sesion) return null;
    if (Date.now() >= sesion.expiraEn) {
      this.cerrarSesion('expirada', this.router.url);
      return null;
    }
    return sesion.token;
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.sesionActual()?.permisos.includes(permiso) ?? false;
  }

  private iniciar(sesion: Sesion): void {
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // La sesión sigue activa en memoria, aunque no podrá recuperarse tras F5.
    }
    this.sesionActual.set(sesion);
    this.programarExpiracion(sesion);
  }

  private programarExpiracion(sesion: Sesion): void {
    if (this.temporizador) clearTimeout(this.temporizador);
    const restante = sesion.expiraEn - Date.now();
    this.temporizador = setTimeout(
      () => this.cerrarSesion('expirada', this.router.url),
      Math.max(restante, 0),
    );
  }

  private leerSesionGuardada(): Sesion | null {
    try {
      const texto = sessionStorage.getItem(CLAVE_SESION);
      if (!texto) return null;
      const sesion = JSON.parse(texto) as Sesion;
      if (!sesion.token || !Number.isFinite(sesion.expiraEn) || Date.now() >= sesion.expiraEn ||
          !Array.isArray(sesion.permisos) || !Array.isArray(sesion.roles)) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }
      return sesion;
    } catch {
      try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* no-op */ }
      return null;
    }
  }
}

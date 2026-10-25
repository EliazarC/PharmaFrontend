import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, PerfilResponse, Permiso, Sesion } from './auth.model';

const CLAVE_SESION = 'pharmasoft.sesion';

/** Segundos restantes a partir de los cuales se avisa que la sesión está por vencer. */
export const UMBRAL_AVISO_SEGUNDOS = 120;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;
  private readonly sesionActual = signal<Sesion | null>(this.leerSesionGuardada());
  private readonly restantes = signal(0);
  private readonly avisoOculto = signal(false);
  /** Único temporizador de la sesión: actualiza la cuenta regresiva y cierra al vencer. */
  private intervalo?: ReturnType<typeof setInterval>;

  readonly sesion = this.sesionActual.asReadonly();
  // No debe llamar a token(): éste puede cerrar la sesión y un computed no puede escribir señales.
  readonly autenticado = computed(() => this.sesionActual() !== null);

  /** Segundos que quedan de la sesión, recalculados desde `expiraEn` (no por resta incremental). */
  readonly segundosRestantes = this.restantes.asReadonly();
  /** true si hay sesión y faltan 120 s o menos para que venza. */
  readonly porVencer = computed(
    () => this.sesionActual() !== null && this.restantes() <= UMBRAL_AVISO_SEGUNDOS,
  );
  /** true si el usuario ocultó el aviso en la sesión actual. Se reinicia al comenzar otra sesión. */
  readonly avisoExpiracionOculto = this.avisoOculto.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.detenerCuentaRegresiva());
    const sesion = this.sesionActual();
    if (sesion) this.iniciarCuentaRegresiva();
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

  /** Perfil del usuario según el servidor (GET /auth/me). El token lo agrega authInterceptor. */
  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.url}/me`);
  }

  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    this.detenerCuentaRegresiva();
    try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* almacenamiento no disponible */ }
    this.sesionActual.set(null);
    this.restantes.set(0);
    this.avisoOculto.set(false);

    const queryParams: Record<string, string> = {};
    if (motivo === 'expirada') queryParams['expirada'] = '1';
    if (volverA && volverA.startsWith('/') && !volverA.startsWith('//') && volverA !== '/login') {
      queryParams['returnUrl'] = volverA;
    }
    void this.router.navigate(['/login'], { queryParams });
  }

  /** Oculta el aviso de expiración solo durante la sesión actual. No renueva ni cierra la sesión. */
  ocultarAvisoExpiracion(): void {
    this.avisoOculto.set(true);
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
    this.avisoOculto.set(false);
    this.sesionActual.set(sesion);
    this.iniciarCuentaRegresiva();
  }

  /** Arranca (o reinicia) el único intervalo de 1 s; nunca quedan dos activos. */
  private iniciarCuentaRegresiva(): void {
    this.detenerCuentaRegresiva();
    this.actualizarCuentaRegresiva();
    if (this.sesionActual()) {
      this.intervalo = setInterval(() => this.actualizarCuentaRegresiva(), 1000);
    }
  }

  private detenerCuentaRegresiva(): void {
    if (this.intervalo !== undefined) clearInterval(this.intervalo);
    this.intervalo = undefined;
  }

  private actualizarCuentaRegresiva(): void {
    const sesion = this.sesionActual();
    if (!sesion) {
      this.restantes.set(0);
      return;
    }
    const msRestantes = sesion.expiraEn - Date.now();
    this.restantes.set(Math.max(0, Math.floor(msRestantes / 1000)));
    if (msRestantes <= 0) this.cerrarSesion('expirada', this.router.url);
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

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth-service';
import { Sesion } from './auth.model';

const CLAVE = 'pharmasoft.sesion';

function sesion(expiraEnMs: number): Sesion {
  return { token: 'tok', expiraEn: expiraEnMs, username: 'u', nombreCompleto: 'U', roles: ['VENDEDOR'], permisos: ['VENTAS_LEER'] };
}

function crear(guardada?: Sesion) {
  sessionStorage.clear();
  if (guardada) sessionStorage.setItem(CLAVE, JSON.stringify(guardada));
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const router = TestBed.inject(Router);
  const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  return { auth: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController), navegar };
}

describe('AuthService: aviso previo a la expiración', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); sessionStorage.clear(); });

  it('porVencer es false sin sesión', () => {
    const { auth } = crear();
    expect(auth.porVencer()).toBe(false);
    expect(auth.segundosRestantes()).toBe(0);
  });

  it('porVencer pasa a true cuando quedan 120 s o menos y la cuenta avanza cada segundo', () => {
    const { auth } = crear(sesion(Date.now() + 125_000));
    expect(auth.segundosRestantes()).toBe(125);
    expect(auth.porVencer()).toBe(false);
    vi.advanceTimersByTime(5_000);
    expect(auth.segundosRestantes()).toBe(120);
    expect(auth.porVencer()).toBe(true);
    vi.advanceTimersByTime(1_000);
    expect(auth.segundosRestantes()).toBe(119);
  });

  it('recalcula desde la hora real aunque el intervalo se retrase', () => {
    const { auth } = crear(sesion(Date.now() + 300_000));
    vi.setSystemTime(Date.now() + 200_000); // salto de reloj / pestaña dormida
    vi.advanceTimersByTime(1_000);
    expect(auth.segundosRestantes()).toBe(99);
  });

  it('al vencer cierra la sesión, redirige al login y limpia el temporizador', () => {
    const { auth, navegar } = crear(sesion(Date.now() + 3_000));
    vi.advanceTimersByTime(3_100);
    expect(auth.sesion()).toBeNull();
    expect(sessionStorage.getItem(CLAVE)).toBeNull();
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(5_000);
    expect(navegar).toHaveBeenCalledTimes(1);
  });

  it('cerrarSesion detiene el intervalo y no deja temporizadores huérfanos', () => {
    const { auth } = crear(sesion(Date.now() + 60_000));
    expect(vi.getTimerCount()).toBe(1);
    auth.cerrarSesion();
    expect(vi.getTimerCount()).toBe(0);
    expect(auth.porVencer()).toBe(false);
  });

  it('ocultar el aviso no cierra la sesión y se reinicia en una sesión nueva', () => {
    const { auth, http } = crear(sesion(Date.now() + 60_000));
    auth.ocultarAvisoExpiracion();
    expect(auth.avisoExpiracionOculto()).toBe(true);
    expect(auth.sesion()).not.toBeNull();

    auth.cerrarSesion();
    auth.login({ username: 'u', password: 'p' }).subscribe();
    http.expectOne(r => r.url.endsWith('/auth/login')).flush({
      token: 't2', tipo: 'Bearer', expiraEnSegundos: 90, username: 'u', nombreCompleto: 'U', roles: [], permisos: [],
    });
    expect(auth.avisoExpiracionOculto()).toBe(false);
    expect(auth.porVencer()).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('un login tras otro no acumula intervalos', () => {
    const { auth, http } = crear();
    for (let i = 0; i < 3; i++) {
      auth.login({ username: 'u', password: 'p' }).subscribe();
      http.expectOne(r => r.url.endsWith('/auth/login')).flush({
        token: 't', tipo: 'Bearer', expiraEnSegundos: 600, username: 'u', nombreCompleto: 'U', roles: [], permisos: [],
      });
    }
    expect(vi.getTimerCount()).toBe(1);
  });

  it('obtenerPerfil consulta GET /auth/me', () => {
    const { auth, http } = crear();
    auth.obtenerPerfil().subscribe();
    const req = http.expectOne(r => r.url.endsWith('/auth/me'));
    expect(req.request.method).toBe('GET');
    req.flush({ username: 'u', nombreCompleto: 'U', roles: [], permisos: [] });
  });
});

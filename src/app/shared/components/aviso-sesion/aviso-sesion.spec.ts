import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AvisoSesion } from './aviso-sesion';

function montar(segundos?: number) {
  sessionStorage.clear();
  if (segundos !== undefined) {
    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify({
      token: 't', expiraEn: Date.now() + segundos * 1000, username: 'u', nombreCompleto: 'U',
      roles: [], permisos: [],
    }));
  }
  TestBed.configureTestingModule({ providers: [provideHttpClient()] });
  vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  const fixture = TestBed.createComponent(AvisoSesion);
  fixture.detectChanges();
  return fixture;
}

describe('AvisoSesion', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); sessionStorage.clear(); });

  it('no aparece con más de 120 s ni sin sesión', () => {
    expect(montar(300).nativeElement.querySelector('[role="status"]')).toBeNull();
    TestBed.resetTestingModule();
    expect(montar().nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('aparece con 107 s y muestra 01:47', () => {
    const f = montar(107);
    const aviso: HTMLElement = f.nativeElement.querySelector('[role="status"]');
    expect(aviso).not.toBeNull();
    expect(aviso.textContent).toContain('Su sesión vence en 01:47');
  });

  it('el contador avanza con formato mm:ss', async () => {
    const f = montar(65);
    vi.advanceTimersByTime(6_000);
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('.tiempo').textContent).toBe('00:59');
  });

  it('el botón × oculta el aviso sin cerrar la sesión', () => {
    const f = montar(90);
    (f.nativeElement.querySelector('.btn-x') as HTMLButtonElement).click();
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(sessionStorage.getItem('pharmasoft.sesion')).not.toBeNull();
  });

  it('«Cerrar sesión ahora» finaliza la sesión y limpia el temporizador', () => {
    const f = montar(90);
    (f.nativeElement.querySelector('.btn-cerrar') as HTMLButtonElement).click();
    f.detectChanges();
    expect(sessionStorage.getItem('pharmasoft.sesion')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MiCuenta } from './mi-cuenta';

const AVISO = 'Sus permisos cambiaron. Cierre sesión y vuelva a ingresar para actualizarlos';

function montar(permisosSesion: string[]) {
  sessionStorage.setItem('pharmasoft.sesion', JSON.stringify({
    token: 't', expiraEn: Date.now() + 600_000, username: 'vendedor', nombreCompleto: 'Lucia',
    roles: ['VENDEDOR'], permisos: permisosSesion,
  }));
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(MiCuenta);
  const http = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, http, el: fixture.nativeElement as HTMLElement };
}

describe('MiCuenta', () => {
  afterEach(() => sessionStorage.clear());

  it('muestra carga, roles y permisos por módulo, y no avisa si los permisos coinciden (sin importar el orden)', async () => {
    const { fixture, http, el } = montar(['VENTAS_LEER', 'CATALOGO_LEER']);
    expect(el.textContent).toContain('Cargando');
    http.expectOne(r => r.url.endsWith('/auth/me')).flush({
      username: 'vendedor', nombreCompleto: 'Lucia Ramos', roles: ['VENDEDOR'], permisos: ['CATALOGO_LEER', 'VENTAS_LEER'],
    });
    fixture.detectChanges();
    expect(el.textContent).toContain('Lucia Ramos');
    expect(el.textContent).toContain('VENDEDOR');
    for (const m of ['Catálogo', 'Clientes', 'Ventas', 'Reportes', 'Usuarios']) expect(el.textContent).toContain(m);
    expect(el.querySelectorAll('li.concedido').length).toBe(2);
    expect(el.textContent).not.toContain(AVISO);
  });

  it('avisa cuando los permisos del servidor difieren de los de la sesión', () => {
    const { fixture, http, el } = montar(['CATALOGO_LEER']);
    http.expectOne(r => r.url.endsWith('/auth/me')).flush({
      username: 'vendedor', nombreCompleto: 'Lucia', roles: ['VENDEDOR'], permisos: ['CATALOGO_LEER', 'VENTAS_LEER'],
    });
    fixture.detectChanges();
    expect(el.textContent).toContain(AVISO);
    // No renueva silenciosamente la sesión
    expect(JSON.parse(sessionStorage.getItem('pharmasoft.sesion')!).permisos).toEqual(['CATALOGO_LEER']);
  });

  it('muestra el error y permite reintentar', () => {
    const { fixture, http, el } = montar([]);
    http.expectOne(r => r.url.endsWith('/auth/me')).flush({ message: 'Fallo' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Fallo');
    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    http.expectOne(r => r.url.endsWith('/auth/me')).flush({ username: 'v', nombreCompleto: 'V', roles: [], permisos: [] });
    fixture.detectChanges();
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(el.textContent).toContain('Sin roles asignados');
  });
});

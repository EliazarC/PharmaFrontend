import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth-interceptor';
import { Sesion } from '../auth/auth.model';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    const sesion: Sesion = {
      token: 'tok-123', expiraEn: Date.now() + 600_000, username: 'u',
      nombreCompleto: 'U', roles: [], permisos: [],
    };
    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => sessionStorage.clear());

  it('agrega Bearer a las peticiones de la API', () => {
    http.get(`${environment.apiUrl}/productos`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/productos`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-123');
    req.flush([]);
  });

  it('no agrega el token a la petición de login', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('no agrega el token a dominios externos', () => {
    http.get('https://example.com/datos').subscribe();
    const req = ctrl.expectOne('https://example.com/datos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('no confunde un dominio que solo empieza igual que la API', () => {
    http.get(`${environment.apiUrl}.evil.com/x`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}.evil.com/x`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('incluye /auth/me entre las peticiones autenticadas', () => {
    http.get(`${environment.apiUrl}/auth/me`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/auth/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-123');
    req.flush({});
  });
});

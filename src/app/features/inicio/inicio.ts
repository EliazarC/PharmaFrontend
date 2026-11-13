import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { MasVendidos } from './mas-vendidos';

@Component({
  selector: 'app-inicio',
  imports: [MasVendidos],
  template: `
    <section class="card">
      <h2>Inicio</h2>
      <p>Bienvenido{{ auth.sesion() ? ', ' + (auth.sesion()?.nombreCompleto || auth.sesion()?.username) : '' }}.</p>
    </section>

    @if (auth.tienePermiso('REPORTES_VER')) {
      @defer (on viewport) {
        <app-mas-vendidos />
      } @placeholder {
        <p class="card">Productos más vendidos</p>
      } @loading (minimum 300ms) {
        <p class="card">Cargando reporte…</p>
      } @error {
        <p class="alerta">No se pudo cargar el reporte.</p>
      }
    }
  `,
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}

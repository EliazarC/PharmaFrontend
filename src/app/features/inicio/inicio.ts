import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';

/** Página de inicio mínima (el ZIP recibido no incluía este componente, que app.routes.ts importa). */
@Component({
  selector: 'app-inicio',
  template: `
    <section class="card">
      <h2>Inicio</h2>
      <p>Bienvenido{{ auth.sesion() ? ', ' + (auth.sesion()?.nombreCompleto || auth.sesion()?.username) : '' }}.</p>
    </section>
  `,
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}

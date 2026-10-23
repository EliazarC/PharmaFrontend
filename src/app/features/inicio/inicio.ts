import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  template: `
    <section class="inicio">
      <h1>Bienvenido a PharmaSoft</h1>
      <p>Panel principal del sistema de gestión farmacéutica.</p>
      <div class="tarjeta">
        <h2>Inicio</h2>
        <p>Utiliza el menú para acceder a categorías, productos,
        ventas y reportes según los permisos de tu usuario.</p>
      </div>
    </section>
  `,
  styles: [`
    .inicio { padding: 1.5rem; }
    .tarjeta {
      margin-top: 1rem;
      padding: 1.25rem;
      border: 1px solid #ddd;
      border-radius: 12px;
    }
  `]
})
export class Inicio {}

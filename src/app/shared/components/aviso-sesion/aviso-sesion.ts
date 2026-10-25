import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth-service';

/** Advertencia fija que aparece cuando a la sesión le quedan 120 s o menos. */
@Component({
  selector: 'app-aviso-sesion',
  templateUrl: './aviso-sesion.html',
  styleUrl: './aviso-sesion.css',
})
export class AvisoSesion {
  protected readonly auth = inject(AuthService);

  protected readonly visible = computed(
    () => this.auth.porVencer() && !this.auth.avisoExpiracionOculto(),
  );

  /** Cuenta regresiva con formato mm:ss. */
  protected readonly tiempo = computed(() => {
    const s = this.auth.segundosRestantes();
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${dos(Math.floor(s / 60))}:${dos(s % 60)}`;
  });

  protected cerrarAhora(): void {
    this.auth.cerrarSesion();
  }

  protected ocultar(): void {
    this.auth.ocultarAvisoExpiracion();
  }
}

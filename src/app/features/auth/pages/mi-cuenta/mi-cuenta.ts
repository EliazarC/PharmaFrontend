import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/auth-service';
import { PerfilResponse } from '../../../../core/auth/auth.model';
import { MODULOS_PERMISOS, mismosPermisos } from '../../../../core/auth/permisos';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly perfil = signal<PerfilResponse | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Permisos del servidor agrupados por módulo, marcando cuáles están concedidos. */
  protected readonly modulos = computed(() => {
    const concedidos = new Set(this.perfil()?.permisos ?? []);
    return MODULOS_PERMISOS.map(m => ({
      modulo: m.modulo,
      permisos: m.permisos.map(p => ({ ...p, concedido: concedidos.has(p.codigo) })),
    }));
  });

  /** Permisos que el servidor devolvió y que la SPA no tiene en su catálogo. */
  protected readonly otrosPermisos = computed(() => {
    const conocidos = new Set<string>(MODULOS_PERMISOS.flatMap(m => m.permisos.map(p => p.codigo)));
    return (this.perfil()?.permisos ?? []).filter(p => !conocidos.has(p));
  });

  /**
   * true si los permisos del servidor difieren de los de la sesión (sin importar el orden).
   * No se actualiza la sesión: el JWT sigue con los permisos con que se emitió.
   */
  protected readonly permisosCambiaron = computed(() => {
    const perfil = this.perfil();
    const sesion = this.auth.sesion();
    return perfil !== null && sesion !== null && !mismosPermisos(perfil.permisos, sesion.permisos);
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.auth.obtenerPerfil().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: perfil => {
        this.perfil.set({ ...perfil, roles: perfil.roles ?? [], permisos: perfil.permisos ?? [] });
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.perfil.set(null);
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}

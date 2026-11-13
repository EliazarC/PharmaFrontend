import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { coincide } from '../../../../core/utils/texto';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  selector: 'app-producto-list',
  imports: [CurrencyPipe, RouterLink, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly resultado = signal<PaginaResponse<Producto> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly orden = signal('nombre');
  protected readonly dir = signal<'asc' | 'desc'>('asc');

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim();
    const contenido = this.resultado()?.contenido ?? [];
    return contenido.filter(p =>
      coincide(texto, p.nombre, p.categoriaNombre ?? '', p.estado ? 'activo' : 'inactivo'));
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.pagina.set(Math.max(0, Number(params.get('pagina') ?? 0) || 0));
      this.tamanio.set(Math.min(50, Math.max(10, Number(params.get('tamanio') ?? 20) || 20)));
      this.orden.set(params.get('orden') || 'nombre');
      this.dir.set(params.get('dir') === 'desc' ? 'desc' : 'asc');
      this.cargar();
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productoService.listar(this.pagina(), this.tamanio(), this.orden(), this.dir()).subscribe({
      next: pagina => {
        this.resultado.set(pagina);
        this.cargando.set(false);
        if (pagina.totalPaginas > 0 && this.pagina() >= pagina.totalPaginas) {
          this.navegar({ pagina: 0 });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  irA(pagina: number): void { this.navegar({ pagina }); }

  cambiarTamanio(tamanio: number): void {
    this.navegar({ tamanio, pagina: 0 });
  }

  ordenarPor(campo: string): void {
    const direccion = this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir: direccion, pagina: 0 });
  }

  private navegar(queryParams: Record<string, string | number>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}

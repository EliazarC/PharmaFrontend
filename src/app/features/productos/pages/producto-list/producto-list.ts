import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { coincide } from '../../../../core/utils/texto';
import { RouterLink } from '@angular/router';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-producto-list',
  imports: [CurrencyPipe, RouterLink, SiPermiso],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim();
    return this.productos().filter(p => coincide(texto, p.nombre, p.categoriaNombre ?? '', p.estado ? 'activo' : 'inactivo'));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productoService.listar(0, 500, 'nombre', 'asc').subscribe({
      next: pagina => { this.productos.set(pagina.contenido); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }
}

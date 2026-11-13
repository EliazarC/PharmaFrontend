import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  selector: 'app-venta-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, SiPermiso, Paginador],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly orden = signal('fecha');
  protected readonly dir = signal<'asc' | 'desc'>('desc');
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });
  protected readonly ahora = signal(new Date());
  protected readonly totalPagina = computed(() => (this.resultado()?.contenido ?? [])
    .filter(v => v.estado === 'REGISTRADA')
    .reduce((suma, v) => suma + Number(v.total || 0), 0));

  protected resumenFiltros(): string {
    const f = this.filtros.getRawValue();
    const cliente = this.clientes().find(c => c.id === f.clienteId);
    const partes = [
      cliente ? `cliente ${cliente.apellidos}, ${cliente.nombres}` : '',
      f.estado ? `estado ${f.estado}` : '',
      f.desde ? `desde ${f.desde}` : '',
      f.hasta ? `hasta ${f.hasta}` : '',
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'ninguno (todas las ventas)';
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print(), 50);
  }

  fechaVenta(venta: Venta): string { return venta.fechaRegistro ?? venta.fecha ?? ''; }

  ngOnInit(): void {
    this.clienteService.listar(0, 100).subscribe({
      next: p => this.clientes.set(p.contenido),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });

    // La URL es la fuente de verdad: filtros, página y tamaño sobreviven a F5.
    this.route.queryParamMap.subscribe(params => {
      this.pagina.set(Math.max(0, Number(params.get('pagina') ?? 0) || 0));
      this.tamanio.set(Math.min(50, Math.max(10, Number(params.get('tamanio') ?? 20) || 20)));
      this.orden.set(params.get('orden') || 'fecha');
      this.dir.set(params.get('dir') === 'asc' ? 'asc' : 'desc');
      this.filtros.patchValue({
        clienteId: params.get('clienteId') ? Number(params.get('clienteId')) : null,
        estado: (params.get('estado') as EstadoVenta | null) ?? null,
        desde: params.get('desde'),
        hasta: params.get('hasta'),
      }, { emitEvent: false });
      this.cargar();
    });
  }

  buscar(): void {
    const f = this.filtros.getRawValue();
    if (f.desde && f.hasta && f.desde > f.hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.error.set(null);
    this.navegar({
      pagina: 0,
      clienteId: f.clienteId,
      estado: f.estado,
      desde: f.desde,
      hasta: f.hasta,
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.error.set(null);
    this.navegar({ pagina: 0, clienteId: null, estado: null, desde: null, hasta: null });
  }

  ordenarPor(campo: string): void {
    const direccion = this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir: direccion, pagina: 0 });
  }

  irA(pagina: number): void { this.navegar({ pagina }); }

  cambiarTamanio(tamanio: number): void {
    this.navegar({ tamanio, pagina: 0 });
  }

  private navegar(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        pagina: this.pagina(),
        tamanio: this.tamanio(),
        orden: this.orden(),
        dir: this.dir(),
        clienteId: this.filtros.controls.clienteId.value,
        estado: this.filtros.controls.estado.value,
        desde: this.filtros.controls.desde.value,
        hasta: this.filtros.controls.hasta.value,
        ...queryParams,
      },
      queryParamsHandling: 'merge',
    });
  }

  private cargar(): void {
    const filtro: FiltroVentas = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.ventaService.buscar(filtro, this.pagina(), this.tamanio(), this.orden(), this.dir()).subscribe({
      next: respuesta => {
        this.resultado.set(respuesta);
        this.cargando.set(false);
        if (respuesta.totalPaginas > 0 && this.pagina() >= respuesta.totalPaginas) {
          this.navegar({ pagina: 0 });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}

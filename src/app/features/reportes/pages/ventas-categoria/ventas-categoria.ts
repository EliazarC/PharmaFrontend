import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { mensajeError } from '../../../../core/utils/http-error';
import { ReporteService } from '../../services/reporte-service';
import { VentaPorCategoria } from '../../models/reporte.model';

interface FilaReporte { nombre: string; total: number; unidades: number; }

@Component({
  selector: 'app-ventas-categoria',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css',
})
export class VentasCategoria implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reporteService = inject(ReporteService);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filasOriginales = signal<VentaPorCategoria[]>([]);
  protected readonly filtros = this.fb.group({ desde: [''], hasta: [''] });
  protected readonly filas = computed<FilaReporte[]>(() => this.filasOriginales().map(f => ({
    nombre: this.nombreCategoria(f),
    total: this.numero(f.montoTotal ?? f.totalVentas ?? f.total ?? f.montoVendido),
    unidades: this.numero(f.cantidadVendida ?? f.unidadesVendidas),
  })).sort((a, b) => b.total - a.total));
  protected readonly totalReporte = computed(() => this.filas().reduce((suma, fila) => suma + fila.total, 0));
  protected readonly maxTotal = computed(() => Math.max(1, ...this.filas().map(f => f.total)));

  ngOnInit(): void { this.cargar(); }

  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.cargar();
  }

  limpiar(): void { this.filtros.reset({ desde: '', hasta: '' }); this.cargar(); }
  imprimirReporte(): void { window.print(); }

  private cargar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.reporteService.ventasPorCategoria(desde || null, hasta || null).subscribe({
      next: filas => { this.filasOriginales.set(filas); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  protected nombreCategoria(fila: VentaPorCategoria): string {
    if (typeof fila.categoria === 'string') return fila.categoria;
    return fila.categoriaNombre ?? fila.nombreCategoria ?? fila.categoria?.nombre ?? 'Sin categoría';
  }

  protected numero(valor: unknown): number { const n = Number(valor ?? 0); return Number.isFinite(n) ? n : 0; }
  protected anchoBarra(total: number): string { return `${Math.max(total > 0 ? 2 : 0, total / this.maxTotal() * 100)}%`; }
}

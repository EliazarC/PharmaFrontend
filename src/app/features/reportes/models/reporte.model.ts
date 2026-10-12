/** DTO de PharmaBackend: VentaPorCategoriaDTO. */
export interface VentaPorCategoria {
  categoriaId?: number;
  categoriaNombre?: string;
  cantidadVendida?: number;
  montoTotal?: number;
  // Compatibilidad con variantes de nombres empleadas por otras versiones de la API.
  nombreCategoria?: string;
  categoria?: string | { nombre?: string };
  totalVentas?: number;
  total?: number;
  montoVendido?: number;
  unidadesVendidas?: number;
  cantidadVentas?: number;
  numeroVentas?: number;
}

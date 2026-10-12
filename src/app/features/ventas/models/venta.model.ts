export type EstadoVenta = 'REGISTRADA' | 'ANULADA';

/** Detalle tal como lo devuelve el backend. */
export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

/** Cabecera con sus detalles calculados por el servidor. */
export interface Venta {
  id: number;
  fechaRegistro?: string;
  fecha?: string;
  clienteId: number;
  clienteNombre: string;
  estado: EstadoVenta;
  total: number;
  detalles: DetalleVenta[];
}

/** El request solo incluye identificadores y cantidades. */
export interface VentaRequest {
  clienteId: number;
  detalles: { productoId: number; cantidad: number }[];
}

export interface FiltroVentas {
  clienteId: number | null;
  estado: EstadoVenta | null;
  desde: string | null;
  hasta: string | null;
}

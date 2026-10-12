export interface MenuItem {
  etiqueta: string;
  ruta: string;
  icono: string;
}

export const MENU: MenuItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: '🏠' },
  { etiqueta: 'Categorías', ruta: '/categorias', icono: '🗂️' },
  { etiqueta: 'Productos y stock', ruta: '/productos', icono: '📦' },
  { etiqueta: 'Ventas', ruta: '/ventas', icono: '🧾' },
  { etiqueta: 'Reporte por categoría', ruta: '/reportes/ventas-categoria', icono: '📊' },
  // Clientes y productos se consultan desde sus servicios para armar ventas.
];

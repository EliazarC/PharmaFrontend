import { Routes } from '@angular/router';
import { VentasCategoria } from './pages/ventas-categoria/ventas-categoria';

export const REPORTES_ROUTES: Routes = [
  { path: 'ventas-categoria', component: VentasCategoria, title: 'Reporte de ventas por categoría' },
];

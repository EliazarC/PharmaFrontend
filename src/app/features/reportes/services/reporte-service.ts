import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VentaPorCategoria } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  ventasPorCategoria(desde: string | null, hasta: string | null): Observable<VentaPorCategoria[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<unknown>(`${this.url}/ventas-por-categoria`, { params }).pipe(
      map(respuesta => {
        if (Array.isArray(respuesta)) return respuesta as VentaPorCategoria[];
        if (respuesta && typeof respuesta === 'object') {
          const objeto = respuesta as Record<string, unknown>;
          const filas = objeto['contenido'] ?? objeto['content'] ?? objeto['datos'] ?? objeto['data'];
          if (Array.isArray(filas)) return filas as VentaPorCategoria[];
        }
        return [];
      }),
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse, normalizarPagina } from '../../../core/models/pagina-response';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(pagina = 0, tamanio = 20, ordenarPor = 'nombre', direccion: 'asc' | 'desc' = 'asc'):
    Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);
    return this.http.get<unknown>(this.url, { params }).pipe(
      map(respuesta => normalizarPagina<Producto>(respuesta, pagina, tamanio)),
    );
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse, normalizarPagina } from '../../../core/models/pagina-response';
import { AuditoriaEvento } from '../models/auditoria-evento.model';

export interface FiltroAuditoria {
  usuario: string;
  accion: string;
  desde: string;
  hasta: string;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auditoria`;

  buscar(filtro: FiltroAuditoria, pagina: number, tamanio: number):
    Observable<PaginaResponse<AuditoriaEvento>> {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio);
    if (filtro.usuario.trim()) params = params.set('usuario', filtro.usuario.trim());
    if (filtro.accion.trim()) params = params.set('accion', filtro.accion.trim());
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);
    return this.http.get<unknown>(this.url, { params }).pipe(
      map(respuesta => normalizarPagina<AuditoriaEvento>(respuesta, pagina, tamanio)),
    );
  }
}

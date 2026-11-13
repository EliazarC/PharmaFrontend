import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { AuditoriaEvento } from '../../models/auditoria-evento.model';
import { AuditoriaService, FiltroAuditoria } from '../../services/auditoria-service';

@Component({
  selector: 'app-auditoria-list',
  imports: [DatePipe, Paginador],
  templateUrl: './auditoria-list.html',
  styleUrl: './auditoria-list.css',
})
export class AuditoriaList implements OnInit {
  private readonly service = inject(AuditoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly usuario = signal('');
  protected readonly accion = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly resultado = signal<PaginaResponse<AuditoriaEvento> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.usuario.set(params.get('usuario') ?? '');
      this.accion.set(params.get('accion') ?? '');
      this.desde.set(params.get('desde') ?? '');
      this.hasta.set(params.get('hasta') ?? '');
      this.pagina.set(Math.max(0, Number(params.get('pagina') ?? 0) || 0));
      this.tamanio.set(Math.min(50, Math.max(10, Number(params.get('tamanio') ?? 20) || 20)));
      this.cargar();
    });
  }

  buscar(): void {
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha «desde» no puede ser posterior a «hasta».');
      return;
    }
    this.navegar({
      usuario: this.usuario() || null,
      accion: this.accion() || null,
      desde: this.desde() || null,
      hasta: this.hasta() || null,
      pagina: 0,
    });
  }

  limpiar(): void {
    this.usuario.set('');
    this.accion.set('');
    this.desde.set('');
    this.hasta.set('');
    this.error.set(null);
    this.navegar({ usuario: null, accion: null, desde: null, hasta: null, pagina: 0 });
  }

  irA(pagina: number): void { this.navegar({ pagina }); }
  cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }

  private navegar(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private cargar(): void {
    const filtro: FiltroAuditoria = {
      usuario: this.usuario(),
      accion: this.accion(),
      desde: this.desde(),
      hasta: this.hasta(),
    };
    this.cargando.set(true);
    this.error.set(null);
    this.service.buscar(filtro, this.pagina(), this.tamanio()).subscribe({
      next: resultado => {
        this.resultado.set(resultado);
        this.cargando.set(false);
        if (resultado.totalPaginas > 0 && this.pagina() >= resultado.totalPaginas) {
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

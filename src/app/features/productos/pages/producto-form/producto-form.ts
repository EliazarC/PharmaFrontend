import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productos = inject(ProductoService);
  private readonly categoriasService = inject(CategoriaService);
  private readonly router = inject(Router);
  readonly id = input<string>();
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.max(2147483647)]],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    estado: [true],
  });

  ngOnInit(): void {
    this.categoriasService.listar().subscribe({
      next: items => this.categorias.set(items.filter(c => c.estado)),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    const id = this.id();
    if (id) {
      this.productos.obtener(Number(id)).subscribe({
        next: p => this.form.setValue({
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precio: Number(p.precio),
          stock: Number(p.stock),
          categoriaId: Number(p.categoriaId ?? p.categoria?.id ?? 0),
          estado: p.estado,
        }),
        error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
      });
    }
  }

  esEdicion(): boolean { return !!this.id(); }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dto: ProductoRequest = {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      precio: Number(v.precio),
      stock: Number(v.stock),
      categoriaId: Number(v.categoriaId),
      estado: v.estado,
    };
    const id = this.id();
    const peticion = id ? this.productos.actualizar(Number(id), dto) : this.productos.crear(dto);
    this.guardando.set(true);
    this.error.set(null);
    peticion.subscribe({
      next: () => void this.router.navigate(['/productos']),
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.guardando.set(false);
      },
    });
  }
}

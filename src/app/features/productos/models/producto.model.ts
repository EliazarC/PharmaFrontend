export interface ProductoCategoria {
  id?: number;
  nombre?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId?: number;
  categoriaNombre?: string;
  categoria?: ProductoCategoria | null;
}

import { Permiso } from './auth.model';

export interface ModuloPermisos {
  modulo: string;
  permisos: { codigo: Permiso; accion: string }[];
}

/**
 * Catálogo de permisos que conoce la SPA, agrupado por módulo.
 * Los códigos son los del tipo `Permiso` (enum Permiso del backend).
 */
export const MODULOS_PERMISOS: readonly ModuloPermisos[] = [
  { modulo: 'Catálogo', permisos: [
    { codigo: 'CATALOGO_LEER', accion: 'Leer' },
    { codigo: 'CATALOGO_ESCRIBIR', accion: 'Escribir' },
  ] },
  { modulo: 'Clientes', permisos: [
    { codigo: 'CLIENTES_LEER', accion: 'Leer' },
    { codigo: 'CLIENTES_ESCRIBIR', accion: 'Escribir' },
  ] },
  { modulo: 'Ventas', permisos: [
    { codigo: 'VENTAS_LEER', accion: 'Leer' },
    { codigo: 'VENTAS_REGISTRAR', accion: 'Registrar' },
  ] },
  { modulo: 'Reportes', permisos: [
    { codigo: 'REPORTES_VER', accion: 'Ver' },
  ] },
  { modulo: 'Usuarios', permisos: [
    { codigo: 'USUARIOS_ADMINISTRAR', accion: 'Administrar' },
  ] },
];

/**
 * true si ambas listas contienen exactamente los mismos permisos.
 * Ignora el orden y los duplicados, y tolera listas nulas o ausentes.
 */
export function mismosPermisos(
  a: readonly string[] | null | undefined,
  b: readonly string[] | null | undefined,
): boolean {
  const conjuntoA = new Set(a ?? []);
  const conjuntoB = new Set(b ?? []);
  if (conjuntoA.size !== conjuntoB.size) return false;
  for (const permiso of conjuntoA) {
    if (!conjuntoB.has(permiso)) return false;
  }
  return true;
}

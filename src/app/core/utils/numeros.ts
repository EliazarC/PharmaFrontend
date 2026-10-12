/** Redondea a dos decimales (montos en soles). */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

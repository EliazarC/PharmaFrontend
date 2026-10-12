/** Estructura común de las respuestas paginadas del backend. */
export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

/** Acepta tanto los nombres del contrato de PharmaSoft como los de Spring Page. */
export function normalizarPagina<T>(respuesta: unknown, paginaSolicitada = 0, tamanioSolicitado = 10): PaginaResponse<T> {
  if (Array.isArray(respuesta)) {
    return {
      contenido: (respuesta as T[]).slice(paginaSolicitada * tamanioSolicitado, (paginaSolicitada + 1) * tamanioSolicitado),
      pagina: paginaSolicitada,
      tamanio: tamanioSolicitado,
      totalElementos: respuesta.length,
      totalPaginas: Math.ceil(respuesta.length / Math.max(1, tamanioSolicitado)),
      primera: paginaSolicitada === 0,
      ultima: paginaSolicitada >= Math.max(0, Math.ceil(respuesta.length / Math.max(1, tamanioSolicitado)) - 1),
    };
  }

  const datos = (respuesta && typeof respuesta === 'object' ? respuesta : {}) as Record<string, unknown>;
  const contenido = Array.isArray(datos['contenido'])
    ? datos['contenido'] as T[]
    : Array.isArray(datos['content']) ? datos['content'] as T[] : [];
  const pagina = numero(datos['pagina'] ?? datos['number'], paginaSolicitada);
  const tamanio = numero(datos['tamanio'] ?? datos['size'], tamanioSolicitado);
  const totalElementos = numero(datos['totalElementos'] ?? datos['totalElements'], contenido.length);
  const totalPaginas = numero(datos['totalPaginas'] ?? datos['totalPages'], totalElementos ? 1 : 0);
  return {
    contenido,
    pagina,
    tamanio,
    totalElementos,
    totalPaginas,
    primera: Boolean(datos['primera'] ?? datos['first'] ?? pagina === 0),
    ultima: Boolean(datos['ultima'] ?? datos['last'] ?? pagina >= totalPaginas - 1),
  };
}

function numero(valor: unknown, porDefecto: number): number {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : porDefecto;
}

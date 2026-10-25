import { mismosPermisos } from './permisos';

describe('mismosPermisos', () => {
  it('ignora el orden', () => {
    expect(mismosPermisos(['A', 'B'], ['B', 'A'])).toBe(true);
  });
  it('detecta un permiso distinto', () => {
    expect(mismosPermisos(['A', 'B'], ['A', 'C'])).toBe(false);
  });
  it('detecta un permiso de más o de menos', () => {
    expect(mismosPermisos(['A'], ['A', 'B'])).toBe(false);
    expect(mismosPermisos(['A', 'B'], ['A'])).toBe(false);
  });
  it('trata nulos y vacíos como iguales', () => {
    expect(mismosPermisos(null, [])).toBe(true);
    expect(mismosPermisos(undefined, null)).toBe(true);
    expect(mismosPermisos(null, ['A'])).toBe(false);
  });
});

import { expect, Page } from '@playwright/test';

type VariablesProceso = { env?: Record<string, string | undefined> };
const env = (globalThis as typeof globalThis & { process?: VariablesProceso }).process?.env ?? {};

function obligatorio(nombre: string): string {
  const valor = env[nombre];
  if (!valor) {
    throw new Error(`Configura la variable de entorno ${nombre} antes de ejecutar Playwright.`);
  }
  return valor;
}

export const USUARIOS = {
  admin: { usuario: env.E2E_ADMIN_USER || 'admin', clave: () => obligatorio('E2E_ADMIN_PASSWORD') },
  vendedor: { usuario: env.E2E_VENDEDOR_USER || 'vendedor', clave: () => obligatorio('E2E_VENDEDOR_PASSWORD') },
  almacen: { usuario: env.E2E_ALMACEN_USER || 'almacen', clave: () => obligatorio('E2E_ALMACEN_PASSWORD') },
} as const;

export const BUSQUEDA_CLIENTE_E2E = env.E2E_CLIENTE_BUSQUEDA || 'Cliente E2E';
export const BUSQUEDA_PRODUCTO_E2E = env.E2E_PRODUCTO_BUSQUEDA || 'A - Paracetamol E2E';

export async function iniciarSesion(
  page: Page,
  quien: keyof typeof USUARIOS,
  ruta = '/inicio',
): Promise<void> {
  const cuenta = USUARIOS[quien];
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Usuario').fill(cuenta.usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(cuenta.clave());
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toBeVisible();
}

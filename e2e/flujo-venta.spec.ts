import { expect, test } from '@playwright/test';
import { iniciarSesion, BUSQUEDA_CLIENTE_E2E, BUSQUEDA_PRODUCTO_E2E } from './apoyo';

test('flujo principal: vendedor registra una venta y el stock baja', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');

  await page.getByTestId('buscar-cliente').fill(BUSQUEDA_CLIENTE_E2E);
  await page.getByTestId('opcion-cliente').first().click();

  await page.getByTestId('buscar-producto').fill(BUSQUEDA_PRODUCTO_E2E);
  const opcion = page.getByTestId('opcion-producto').first();
  const stockAntes = Number(await opcion.getAttribute('data-stock'));
  expect(stockAntes).toBeGreaterThanOrEqual(2);
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toHaveText(/S\/\s*0(?:\.00)?/);

  await page.getByRole('button', { name: 'Revisar venta' }).click();
  const registro = page.waitForResponse(response =>
    response.url().endsWith('/api/v1/ventas') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  expect((await registro).status()).toBe(201);
  await expect(page).toHaveURL(/\/ventas\/\d+/);

  await page.getByRole('link', { name: /Productos y stock/i }).click();
  const filaProducto = page.getByTestId('tabla-productos')
    .locator('tr', { hasText: BUSQUEDA_PRODUCTO_E2E }).first();
  await expect(filaProducto.locator('td').nth(3)).toHaveText(String(stockAntes - 2));
});

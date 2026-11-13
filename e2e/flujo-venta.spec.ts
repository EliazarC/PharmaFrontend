import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('flujo principal: vendedor registra una venta y el stock baja', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');

  await page.getByTestId('buscar-cliente').fill('Mamani');
  await page.getByTestId('opcion-cliente').first().click();

  await page.getByTestId('buscar-producto').fill('Paracetamol');
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

  await page.goto('/productos?pagina=0&tamanio=20&orden=nombre&dir=asc');
  const filaProducto = page.getByTestId('tabla-productos')
    .locator('tr', { hasText: 'Paracetamol' }).first();
  await expect(filaProducto.locator('td').nth(3)).toHaveText(String(stockAntes - 2));
});

import { expect, test } from '@playwright/test';
import { iniciarSesion, API_BASE_URL } from './apoyo';

test('productos se paginan en el servidor y la página permanece en la URL tras F5', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/productos');
  const filas = page.getByTestId('tabla-productos').locator('tbody tr');

  await expect(filas).toHaveCount(20);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de \d+/);

  const respuesta = page.waitForResponse(response =>
    response.url().includes('/api/v1/productos') &&
    response.url().includes('pagina=1') &&
    response.request().method() === 'GET');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  expect((await respuesta).status()).toBe(200);

  await expect(page).toHaveURL(/pagina=1/);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);

  const token = await page.evaluate(() => {
    const sesion = JSON.parse(sessionStorage.getItem('pharmasoft.sesion') ?? 'null');
    return sesion?.token as string | undefined;
  });
  expect(token).toBeTruthy();
  const limite = await page.request.get(`${API_BASE_URL}/productos?pagina=0&tamanio=500`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(limite.status()).toBe(409);
});

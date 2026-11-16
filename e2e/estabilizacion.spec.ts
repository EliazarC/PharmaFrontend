import { expect, test, type Page, type Response } from '@playwright/test';
import { normalizarPagina } from '../src/app/core/models/pagina-response';
import type { Cliente } from '../src/app/features/clientes/models/cliente.model';
import {
  API_BASE_URL,
  BUSQUEDA_CLIENTE_E2E,
  BUSQUEDA_PRODUCTO_E2E,
  iniciarSesion,
  USUARIOS,
} from './apoyo';

async function seleccionarCliente(page: Page): Promise<void> {
  await page.getByTestId('buscar-cliente').fill(BUSQUEDA_CLIENTE_E2E);
  await page.getByTestId('opcion-cliente').first().click();
}

async function agregarProducto(page: Page): Promise<void> {
  await page.getByTestId('buscar-producto').fill(BUSQUEDA_PRODUCTO_E2E);
  await page.getByTestId('opcion-producto').first().click();
}

async function confirmarVenta(page: Page): Promise<Response> {
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  const confirmacion = page.getByRole('dialog', { name: 'Confirmar venta' });
  await confirmacion.getByRole('checkbox', { name: /Imprimir el comprobante/ }).uncheck();

  const registro = page.waitForResponse(respuesta =>
    new URL(respuesta.url()).pathname === '/api/v1/ventas' &&
    respuesta.request().method() === 'POST');
  await confirmacion.getByRole('button', { name: 'Confirmar venta' }).click();
  return registro;
}

async function cabeceraSesion(page: Page): Promise<{ Authorization: string }> {
  const token = await page.evaluate(() => {
    const sesion = JSON.parse(sessionStorage.getItem('pharmasoft.sesion') ?? 'null');
    return sesion?.token as string | undefined;
  });
  expect(token, 'La sesión debe incluir el token de acceso').toBeTruthy();
  return { Authorization: `Bearer ${token}` };
}

async function contarVentas(page: Page, headers: { Authorization: string }): Promise<number> {
  const respuesta = await page.request.get(`${API_BASE_URL}/ventas/buscar`, {
    headers,
    params: { pagina: 0, tamanio: 10 },
  });
  expect(respuesta.status()).toBe(200);
  const { totalElementos } = await respuesta.json();
  expect(typeof totalElementos).toBe('number');
  return totalElementos;
}

test('E2E-08: una venta que supera el stock devuelve 409 y no se registra', async ({ page }) => {
  let stockReal: number | undefined;
  // Simula una lectura desactualizada del catálogo. El POST se envía al backend real.
  await page.route('**/api/v1/productos?**', async route => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }
    const respuesta = await route.fetch();
    if (!respuesta.ok()) {
      await route.fulfill({ response: respuesta });
      return;
    }
    const pagina = await respuesta.json();
    const producto = pagina.contenido.find(
      (fila: { nombre: string; estado: boolean }) =>
        fila.estado && fila.nombre.toLowerCase().includes(BUSQUEDA_PRODUCTO_E2E.toLowerCase()),
    );
    if (producto) {
      stockReal = producto.stock;
      producto.stock += 1;
    }
    await route.fulfill({ response: respuesta, json: pagina });
  });

  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await seleccionarCliente(page);
  await agregarProducto(page);
  expect(typeof stockReal, 'El catálogo debe contener el producto de pruebas').toBe('number');
  await page.getByTestId('cantidad').fill(String(Number(stockReal) + 1));

  const headers = await cabeceraSesion(page);
  const ventasAntes = await contarVentas(page, headers);
  const respuesta = await confirmarVenta(page);

  expect(respuesta.status()).toBe(409);
  await expect(page.getByRole('alert')).toHaveText(/Stock insuficiente/i);
  await expect(page).toHaveURL(/\/ventas\/nueva$/);
  expect(await contarVentas(page, headers)).toBe(ventasAntes);
});

test('E2E-09: una venta sin productos se bloquea y la API devuelve 400', async ({ page }) => {
  const listado = page.waitForResponse(respuesta =>
    new URL(respuesta.url()).pathname === '/api/v1/clientes' &&
    respuesta.request().method() === 'GET');
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await seleccionarCliente(page);

  await page.getByRole('button', { name: 'Revisar venta' }).click();
  await expect(page.getByText(/Agregue al menos un producto/)).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Confirmar venta' })).toHaveCount(0);

  const clientes = await listado;
  expect(clientes.status()).toBe(200);
  const { contenido } = normalizarPagina<Cliente>(await clientes.json(), 0, 100);
  const cliente = contenido.find(fila => fila.estado);
  if (!cliente) throw new Error('Debe haber un cliente activo en los datos de prueba');
  const respuesta = await page.request.post(`${API_BASE_URL}/ventas`, {
    headers: await cabeceraSesion(page),
    data: { clienteId: cliente.id, detalles: [] },
  });
  expect(respuesta.status()).toBe(400);
  expect((await respuesta.json()).validationErrors).toHaveProperty('detalles');
});

test('E2E-11: al cambiar fechas desde la página 3 de Ventas se vuelve a la primera', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas?pagina=2&tamanio=20');
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 3 de \d+/);

  const desde = '2000-01-01';
  await page.getByLabel('Desde', { exact: true }).fill(desde);
  const recarga = page.waitForResponse(respuesta => {
    const url = new URL(respuesta.url());
    return url.pathname === '/api/v1/ventas/buscar' &&
      url.searchParams.get('desde') === desde &&
      url.searchParams.get('pagina') === '0' &&
      respuesta.request().method() === 'GET';
  });
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  expect((await recarga).status()).toBe(200);
  await expect(page).toHaveURL(url =>
    url.searchParams.get('pagina') === '0' && url.searchParams.get('desde') === desde);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de \d+/);
});

test('E2E-12: el administrador ve la venta recién registrada en Auditoría', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await seleccionarCliente(page);
  await agregarProducto(page);

  const respuesta = await confirmarVenta(page);
  expect(respuesta.status()).toBe(201);
  const { id } = await respuesta.json();
  const requestId = (await respuesta.allHeaders())['x-request-id'];
  expect(requestId, 'El registro debe devolver su X-Request-Id').toBeTruthy();
  await expect(page).toHaveURL(url => url.pathname === `/ventas/${id}`);

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await iniciarSesion(page, 'admin', '/auditoria');
  await page.getByLabel('Usuario', { exact: true }).fill(USUARIOS.vendedor.usuario);
  await page.locator('form.filtros').getByRole('combobox').selectOption('VENTA_REGISTRADA');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const fila = page.getByTestId('tabla-auditoria').getByRole('row').filter({
    has: page.getByRole('cell', { name: requestId, exact: true }),
  });
  await expect(fila.getByRole('cell', { name: String(id), exact: true })).toBeVisible();
  await expect(fila.getByRole('cell', { name: 'VENTA_REGISTRADA', exact: true })).toBeVisible();
  await expect(fila.getByRole('cell', { name: USUARIOS.vendedor.usuario, exact: true })).toBeVisible();
});

test('E2E-13: el vendedor no ve Auditoría y se le deniega el acceso directo', async ({ page }) => {
  await iniciarSesion(page, 'vendedor');
  await expect(page.getByRole('link', { name: /Auditoría/i })).toHaveCount(0);

  await page.goto('/auditoria');
  await expect(page.getByRole('heading', { name: /Acceso denegado/i })).toBeVisible();
});

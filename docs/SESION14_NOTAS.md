# Sesión 14 — configuración local de pruebas

La rama `feature/integracion-estabilizacion-cauna` conserva como base la optimización de la sesión 13 y contiene las implementaciones de la sesión 14.

## Preparación de base de datos
1. Confirmar que la cuenta apunta al esquema de desarrollo de Oracle.
2. Arrancar Redis.
3. Iniciar el backend para que Flyway aplique V4.
4. Ejecutar una sola vez `docs/sql/volumen_pruebas.sql` en un esquema de prueba. Crea 5.000 productos, 20.000 ventas sintéticas y fixtures de venta E2E.
5. No ejecutar el script en producción: genera registros ficticios.

## Pruebas de navegador
En PowerShell, desde el frontend:

```powershell
$env:E2E_ADMIN_USER = "admin"
$env:E2E_ADMIN_PASSWORD = "TU_CLAVE_LOCAL_ADMIN"
$env:E2E_VENDEDOR_USER = "vendedor"
$env:E2E_VENDEDOR_PASSWORD = "TU_CLAVE_LOCAL_VENDEDOR"
$env:E2E_ALMACEN_USER = "almacen"
$env:E2E_ALMACEN_PASSWORD = "TU_CLAVE_LOCAL_ALMACEN"
$env:E2E_API_URL = "http://localhost:8080/api/v1"

npm ci
npx playwright install chromium
npm run build
npm run e2e
npx playwright test --repeat-each=3
npx playwright show-report
```

Las contraseñas se leen desde variables del entorno y no están almacenadas en el repositorio. Cambia los nombres de usuario/API si tu entorno local difiere.

## Fixtures
Por defecto, la prueba de venta busca:
- Cliente: `Cliente E2E` (DNI ficticio 99999998, en el esquema de pruebas).
- Producto: `A - Paracetamol E2E` (stock inicial 1000).

Puedes sobreescribir las búsquedas con `E2E_CLIENTE_BUSQUEDA` y `E2E_PRODUCTO_BUSQUEDA`.

## Criterio de cierre
- Build backend y frontend correctos.
- Migración V4 aplicada.
- Siete pruebas E2E aprobadas en tres corridas consecutivas.
- Completar mediciones, matriz de integración e incidencias con resultados reales.

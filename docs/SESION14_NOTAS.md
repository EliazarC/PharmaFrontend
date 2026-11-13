# Sesión 14 — ejecución local

Esta rama contiene la implementación de la sesión 14 sobre la base de optimización de sesión 13.

## Antes de probar
1. Asegurarse de que las migraciones V1–V3 previas están en `flyway_schema_history`.
2. Iniciar Oracle y Redis.
3. Ejecutar el backend con perfil dev y comprobar que Flyway aplica V4.
4. Ejecutar `docs/sql/volumen_pruebas.sql` únicamente en desarrollo y tras confirmar que existe al menos una categoría y un cliente.
5. Iniciar Angular con `npm install` y `npm start`.

## Playwright
La dependencia `@playwright/test` está declarada en `package.json` y `package-lock.json`.

```powershell
npx playwright install chromium
npx playwright test
npx playwright test --repeat-each=3
npx playwright show-report
```

Los datos de ejemplo del curso son admin/Admin2026*, vendedor/Vendedor2026* y almacen/Almacen2026*. En `e2e/apoyo.ts` se deben ajustar si las credenciales locales del esquema son distintas. En `e2e/flujo-venta.spec.ts`, adaptar el nombre del cliente y producto si los datos del esquema no contienen Mamani y Paracetamol. El producto debe tener al menos dos unidades disponibles.

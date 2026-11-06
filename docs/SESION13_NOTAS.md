# Sesión 13 — PharmaFrontend

## Cambios
- El inicio carga el reporte de productos más vendidos con `@defer (on viewport)` y solo para usuarios con `REPORTES_VER`.
- Se conservan las rutas `loadComponent` y `loadChildren` existentes.
- Producción utiliza `/api/v1`; desarrollo utiliza `http://localhost:8081/api/v1`.
- Se agregan configuración de Nginx y Docker Compose.

## Verificación local pendiente
- Ejecutar `npm ci` y `npm run build`.
- Registrar Initial total y Lazy chunk files.
- Levantar Docker Compose y validar Cache-Control, proxy `/api/` y F5 en `/productos`.
- Completar las mediciones y capturas reales antes/después; no se inventan resultados.

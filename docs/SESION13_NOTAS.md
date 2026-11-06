# Sesión 13 — PharmaFrontend

## Cambios
- El inicio carga el reporte de productos más vendidos con `@defer (on viewport)` y solo para usuarios con `REPORTES_VER`.
- Se conservan las rutas `loadComponent` y `loadChildren` existentes.
- Producción utiliza la API relativa `/api/v1`; desarrollo utiliza `http://localhost:8080/api/v1`.
- Angular reemplaza `environment.ts` por `environment.development.ts` en desarrollo.
- Se mantienen los budgets de tamaño y `outputHashing: all`.
- Nginx sirve la SPA, aplica caché diferenciada, compresión, proxy a Backend en puerto 8080 y fallback de rutas Angular.
- Docker Compose levanta Redis 7 y Nginx. El Backend se ejecuta en la máquina anfitriona y Redis queda disponible en localhost:6379.

## Validación local en Windows PowerShell

En la raíz de PharmaFrontend:

```powershell
npm ci
npm run build
```

Registra en la tabla de evidencias `Initial total` (Raw y Estimated transfer size) y las filas de `Lazy chunk files`.

Después:

```powershell
cd deploy
docker compose up -d
docker compose ps
```

Nginx queda disponible en `http://localhost:8081`; el Backend debe escuchar en `http://localhost:8080`. Redis debe aparecer como `healthy` y Nginx como `running`.

## Verificaciones pendientes
- Iniciar sesión como vendedor: no debe descargar el chunk de más vendidos ni llamar al endpoint del reporte.
- Iniciar sesión como administrador: al hacer scroll debe cargar el reporte diferido.
- Verificar `Cache-Control: public, max-age=31536000, immutable` para los JS/CSS con hash y `Cache-Control: no-cache` para `index.html`.
- Pulsar F5 directamente en `http://localhost:8081/productos` y confirmar que no aparece 404.
- Confirmar que las peticiones `/api/v1/` desde Nginx llegan al Backend.
- Medir los bytes transferidos en la primera visita y en F5 con la caché del navegador habilitada.
- Completar las mediciones antes/después y adjuntar capturas reales; no se inventan tamaños ni resultados.

# Reto 02 · Sesión 11 — cambios

## Nuevo
- `src/app/shared/components/aviso-sesion/` — aviso fijo `role="status"` con cuenta regresiva `mm:ss`, «Cerrar sesión ahora» y «×».
- `src/app/features/auth/pages/mi-cuenta/` — página «Mi cuenta» (GET /auth/me): nombre, usuario, roles, permisos por módulo (✔/✘), carga, error con reintento y aviso si los permisos del servidor difieren de los de la sesión.
- `src/app/core/auth/permisos.ts` — catálogo de permisos por módulo y `mismosPermisos()` (compara conjuntos sin importar el orden).
- `src/app/features/inicio/inicio.ts` — el ZIP recibido no lo traía y `app.routes.ts` lo importa (conserve el suyo si ya existe).
- Pruebas automáticas (`*.spec.ts`), `docs/` (matriz, informe, evidencias, Git).

## Modificado
- `core/auth/auth-service.ts`: `segundosRestantes`, `porVencer`, `avisoExpiracionOculto`, `ocultarAvisoExpiracion()`, `obtenerPerfil()`. Un único `setInterval` de 1 s (recalcula desde `expiraEn`) reemplaza al `setTimeout` anterior: actualiza la cuenta regresiva y cierra la sesión al vencer; se limpia en `cerrarSesion()` y al destruir el servicio. `autenticado` ya no llama a `token()`.
- `core/auth/auth.model.ts`: interfaz `PerfilResponse`.
- `core/interceptors/auth-interceptor.ts`: no añade Authorization a `/auth/login`.
- `features/auth/pages/login/login.ts`: `destino()` rechaza `\`.
- `app.routes.ts`: ruta `/mi-cuenta` (dentro del layout con `authGuard`, sin `permisoGuard`).
- `layout/main-layout/*`: `<app-aviso-sesion />` encima de `<router-outlet />`.
- `layout/header/*`: enlace «Mi cuenta» junto al usuario.
- `header.spec.ts`, `main-layout.spec.ts`: ya fallaban por falta de `provideRouter`; corregidos.

## Verificación realizada
- `ng build`: correcto. `ng test --watch=false`: 28/28 pruebas aprobadas (con Node 24.15.0).
- Pruebas manuales contra el backend: **pendientes** (ver `docs/matriz-pruebas-s11.xlsx`).

## Prueba del aviso (B-01 a B-04)
Cambiar temporalmente `app.jwt.expiracion-minutos` a `3` en PharmaBackend y restaurarlo a `60` después. El backend no se modifica en esta entrega.

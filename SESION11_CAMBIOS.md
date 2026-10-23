# Cambios de la Sesión 11 — PharmaSoft

## Implementado
- Modelos de login, permisos y sesión JWT.
- AuthService con signal, sessionStorage, restauración tras F5 y cierre automático por expiración.
- Interceptores para adjuntar Bearer solo a URLs de la API y manejar 401; 403 conserva la sesión.
- Guards de autenticación, invitado y permisos.
- Login separado del layout y página de acceso denegado.
- Menú y encabezado reactivos a sesión/roles/permisos; cierre de sesión.
- Directiva estructural `*appSiPermiso` y protección de acciones de escritura en categorías, productos y ventas.
- Rutas de alta/edición de productos condicionadas por `CATALOGO_ESCRIBIR`, con formulario Angular basado en los servicios REST ya usados por el proyecto.

## Contrato de backend asumido desde la guía
`POST /api/v1/auth/login` con `username`, `password`; respuesta con `token`, `expiraEnSegundos`, `username`, `nombreCompleto`, `roles` y `permisos`.

## Verificación
- Se comprobó que las importaciones relativas de archivos fuente apuntan a archivos existentes.
- No se pudo ejecutar `ng build` en este entorno: la instalación de npm agotó el tiempo disponible y la versión disponible de Node era `22.16.0`, inferior a la requerida por Angular 22 (`22.22.3+` o `24.15.0+`).
- Debe probarse contra el backend real y completar las 16 capturas descritas en el PDF antes de presentar la entrega.

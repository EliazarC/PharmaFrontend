# PharmaFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Módulo de ventas (Sesión 9)

El frontend incorpora el registro de ventas cabecera–detalle, consulta con filtros, comprobante imprimible y reporte de ventas por categoría. También incorpora una consulta de productos para verificar el stock después de vender.

### Requisitos y ejecución

- Node.js compatible con Angular CLI 22: Node `22.22.3` o superior dentro de la rama 22, o Node `24.15` o superior.
- PharmaBackend ejecutándose y con CORS habilitado para `http://localhost:4200`.
- La URL base de la API se configura en `src/environments/environment.ts` y `src/environments/environment.development.ts` (por defecto `http://localhost:8080/api/v1`).

```bash
npm ci
npm start
```

Abrir `http://localhost:4200`.

### Rutas añadidas

- `/ventas`: consulta paginada de ventas, filtros por cliente/estado/fechas e impresión.
- `/ventas/nueva`: formulario de registro, buscadores tolerantes a tildes, cantidades, subtotales, stock, revisión y confirmación.
- `/ventas/:id`: comprobante con total calculado por el servidor e impresión opcional al registrar.
- `/reportes/ventas-categoria`: reporte visual y tabular por categoría con filtros por fecha.
- `/productos`: consulta de productos y stock actualizado.

El request de registro envía únicamente `clienteId` y la lista de `productoId`/`cantidad`; el servidor calcula precios, subtotales y total. El servicio de ventas admite respuesta paginada (`contenido` o `content`) y listas simples para mantener compatibilidad con distintas versiones de PharmaBackend.


## Seguridad frontend (Sesión 11)

Se integró el flujo de autenticación de la guía práctica de la Sesión 11:

- Login Angular con validación de campos y mensaje genérico para credenciales incorrectas.
- `AuthService` como fuente de sesión mediante signals y `sessionStorage` (`pharmasoft.sesion`).
- Cálculo de expiración, recuperación después de F5 y cierre automático al vencer.
- Interceptores HTTP: encabezado Bearer solo para solicitudes a la API y tratamiento de `401` sin interceptar el error del propio login.
- Guards de autenticación, invitado y permisos; página de acceso denegado para `403`/permisos insuficientes.
- Menú, acciones de categorías y formulario de productos condicionados por permisos.
- Header con usuario, roles, hora de expiración y botón de cierre de sesión.

### Ejecutar en Visual Studio Code

Requisitos: Node.js compatible con Angular 22 y el backend PharmaBackend en ejecución.

```powershell
npm ci
npm start
```

Abrir `http://localhost:4200`. La URL del backend se configura en `src/environments/environment.ts` y `src/environments/environment.development.ts`.

### Usuarios de prueba de la guía

Usar los usuarios y contraseñas definidos en el PDF de la Sesión 11. No se guardan contraseñas en el navegador; la sesión se guarda en `sessionStorage`.

### Verificación pendiente en el entorno local

Las respuestas de login y los permisos deben coincidir con el contrato real de PharmaBackend (`POST /api/v1/auth/login`, con `token`, `expiraEnSegundos`, `username`, `nombreCompleto`, `roles` y `permisos`). Si el backend usa nombres distintos, adaptar el modelo/mapeo en `src/app/core/auth/auth.model.ts` y `auth-service.ts`.

La guía pide registrar capturas de los 16 casos y versionar los cambios en la rama `feature/seguridad-frontend-<apellido>` con al menos cuatro commits y un Pull Request hacia `develop`. El ZIP no crea commits ni publica cambios en GitHub automáticamente.

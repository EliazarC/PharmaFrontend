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

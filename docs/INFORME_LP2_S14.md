# Informe de práctica — Sesión 14

**Estudiante:** Eliazar Cauna  
**Curso:** Lenguaje de Programación II  
**Proyecto:** PharmaSoft / PharmaBackend  
**Sesión:** 14 — Integración y estabilización

> Este documento es una plantilla de evidencias. Completar los valores y adjuntar capturas únicamente después de ejecutar las pruebas en el entorno local.

## 1. Paginación y línea base

| Evidencia | Resultado real |
|---|---|
| Productos cargados | Pendiente de consulta SQL |
| Ventas cargadas | Pendiente de consulta SQL |
| GET /productos página 0, tamaño 20: tiempo y bytes | Pendiente de Postman/DevTools |
| GET /productos última página: tiempo | Pendiente de Postman/DevTools |
| GET /productos con tamaño 500 | Debe responder HTTP 409; pendiente de prueba |

## 2. Matriz de integración

| ID | Origen → destino | Comportamiento que se debe verificar | Resultado |
|---|---|---|---|
| I-01 | Clientes → Venta | Cliente recién registrado aparece al buscar en nueva venta | Pendiente |
| I-02 | Catálogo → Venta | Solo productos activos con stock y precio vigente | Pendiente |
| I-03 | Venta → Catálogo | Al vender dos unidades, Productos refleja el stock descontado sin F5 | Pendiente |
| I-04 | Venta → Reportes | Venta aparece en el reporte de productos más vendidos | Pendiente |
| I-05 | Venta → Auditoría | Existe VENTA_REGISTRADA con usuario y requestId | Pendiente |
| I-06 | Catálogo → Auditoría | Cambiar precio registra precio anterior/nuevo y modificador | Pendiente |
| I-07 | Seguridad → módulos | Token vencido redirige al login y conserva returnUrl | Pendiente |
| I-08 | Paginación → filtros | Cambiar el rango de fechas vuelve a la primera página | Pendiente |

## 3. Auditoría

| Verificación | Resultado |
|---|---|
| Columnas creado_por y modificado_por | Pendiente de prueba en Oracle |
| Eventos de venta confirmada | Pendiente de consulta GET /api/v1/auditoria |
| Login fallido y exitoso | Pendiente de consulta GET /api/v1/auditoria |
| Acceso de auditoría limitado a USUARIOS_ADMINISTRAR | Pendiente de prueba con admin y vendedor |

## 4. Playwright

Ejecutar:

```powershell
npm install
npx playwright install chromium
npx playwright test
npx playwright test --repeat-each=3
npx playwright show-report
```

| Corrida | Pruebas aprobadas |
|---|---|
| 1 | Pendiente / 7 |
| 2 | Pendiente / 7 |
| 3 | Pendiente / 7 |

## 5. Incidencias

Registrar cada defecto reproducido en `docs/incidencias.md`, indicando pasos, severidad, causa, corrección y commit.

## 6. Evidencias visuales

- [INSERTAR EVIDENCIA AQUÍ] Postman: paginación de productos.
- [INSERTAR EVIDENCIA AQUÍ] Postman: tamaño 500 rechazado con HTTP 409.
- [INSERTAR EVIDENCIA AQUÍ] SQL Developer: filas de auditoria_eventos.
- [INSERTAR EVIDENCIA AQUÍ] Angular: paginación y URL.
- [INSERTAR EVIDENCIA AQUÍ] Playwright: siete pruebas y tres corridas consecutivas.

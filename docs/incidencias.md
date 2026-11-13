# Registro de incidencias — Sesión 14

Registrar aquí cada fallo reproducible de la matriz de integración o de Playwright antes de corregirlo.
No marcar una incidencia como cerrada hasta que la corrección y la suite completa hayan pasado.

| ID | Módulo | Descripción y pasos para reproducir | Severidad | Causa | Corrección (commit) | Estado |
|---|---|---|---|---|---|---|
| INC-01 | — | Pendiente de ejecución de pruebas locales | — | — | — | Pendiente |

## Ciclo de atención
1. Reproducir el fallo y conservar la evidencia.
2. Identificar la prueba que falla o agregar una prueba que lo reproduzca.
3. Corregir la causa, no solo el síntoma.
4. Ejecutar nuevamente toda la suite.
5. Registrar el commit que cierra la incidencia.

## Criterio de estabilización
- Las siete pruebas E2E pasan tres veces seguidas con `npx playwright test --repeat-each=3`.
- No quedan incidencias críticas ni altas abiertas.
- La consola del navegador no presenta errores y el backend no devuelve HTTP 500 durante el flujo principal.

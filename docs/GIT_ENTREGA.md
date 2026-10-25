# Pasos de Git para la entrega (Reto 02 · Sesión 11)

> Este ZIP no incluye historial Git, así que los commits, la rama remota y el pull request **no están hechos**:
> deben crearse en su repositorio real (`EliazarC/PharmaFrontend`). Los tres commits deben quedar en **días distintos**
> y el pull request se abre hacia `develop`.

```bash
# 1) Partir de la rama de la práctica y crear la rama del reto
git checkout feature/ventas-cauna        # rama de referencia con la seguridad de la práctica
git pull
git checkout -b feature/seguridad-spa-pruebas-cauna

# 2) Copiar sobre su repositorio los archivos de este ZIP (src/, docs/, SESION11_RETO02.md).
#    No copie node_modules/ ni dist/. Si ya tiene su propio features/inicio/inicio.ts, conserve el suyo.
```

## Día 1 — endurecimiento y base
```bash
git add src/app/core/interceptors/auth-interceptor.ts src/app/core/interceptors/auth-interceptor.spec.ts \
        src/app/features/auth/pages/login/login.ts src/app/features/inicio \
        src/app/layout/header/header.spec.ts src/app/layout/main-layout/main-layout.spec.ts
git commit -m "fix(auth): el login no envía token y se endurece returnUrl; specs del layout"
```

## Día 2 — aviso previo a la expiración
```bash
git add src/app/core/auth/auth-service.ts src/app/core/auth/auth-service.spec.ts \
        src/app/shared/components/aviso-sesion src/app/layout/main-layout
git commit -m "feat(auth): aviso previo a la expiración de la sesión"
```

## Día 3 — Mi cuenta
```bash
git add src/app/core/auth/auth.model.ts src/app/core/auth/permisos.ts src/app/core/auth/permisos.spec.ts \
        src/app/features/auth/pages/mi-cuenta src/app/app.routes.ts src/app/layout/header
git commit -m "feat(auth): página Mi cuenta conectada a auth/me"
```

## Día 4 (o posterior) — matriz e informe, una vez ejecutadas las pruebas
```bash
git add docs SESION11_RETO02.md
git commit -m "test(auth): matriz de pruebas de la SPA segura"
git push -u origin feature/seguridad-spa-pruebas-cauna
```
Luego abra en GitHub un **Pull Request** de `feature/seguridad-spa-pruebas-cauna` hacia `develop`.

# FixcampusFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

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

## Conexión con Spring Boot

Angular obtiene la URL base de `src/environments/environment.ts`. En local, inicia Spring Boot en `http://localhost:8080` y usa `npm.cmd start` para abrir Angular en `http://localhost:4200`.

También puedes probar el build local con `npm.cmd run build` seguido de `npm.cmd run serve:ssr:fixcampus-frontend`. Abre `http://localhost:4000`.

Para publicar, escribe la URL HTTPS pública de Spring en `environment.ts` y vuelve a compilar. Configura `FRONTEND_ORIGINS` en Spring con el origen exacto del frontend, por ejemplo `https://fixcampus.ejemplo.com`. Si hay más de un origen autorizado, sepáralos por comas. Si ejecutas el servidor Node del build, configura también `NG_ALLOWED_HOSTS` con el nombre de dominio del frontend, sin protocolo.

### Render

En el sitio estático de Render, selecciona la rama `Matias-Flores`. Usa `npm ci && npm run build:render` como comando y `dist/fixcampus-frontend/browser` como directorio público. Agrega una reescritura de `/*` a `/index.html` para abrir rutas de Angular desde un enlace directo. El build de Render toma la URL de `src/environments/environment.render.ts`. Incluye el origen HTTPS del sitio en `FRONTEND_ORIGINS` de Spring.

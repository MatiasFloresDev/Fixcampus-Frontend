# FixCampus · Frontend

Frontend del equipo UrbanIT para registrar y dar seguimiento a incidencias de infraestructura del campus.

## Ejecutar en local

Requisitos: Node.js 24.16.0 (o una versión compatible con Angular 22) y npm.

```powershell
npm ci
npm start
```

Abrir http://localhost:4200.

## Verificar

```powershell
npm run build
npm test -- --watch=false
```

La compilación genera dist/fixcampus-frontend. Para ejecutar el servidor de producción después de compilar: npm run serve:ssr:fixcampus-frontend.

## Qué incluye este inicio

- Proyecto Angular con Router, SSR e hidratación.
- Angular Material y configuración de HttpClient.
- Pantalla inicial y encabezado de FixCampus, adaptados a escritorio y celular.
- Colores, tipografías y recursos locales de la base visual.
- Carpetas para componentes, servicios y modelos.

Login, registro, permisos, gráficos y evidencias todavía están pendientes. No hay autenticación simulada ni servicios conectados a endpoints sin validar. Los módulos de los demás integrantes se desarrollan por sus responsables.

## Organización

- src/app/components: componentes con archivos TS, HTML y CSS separados.
- src/app/services: llamadas HTTP y lógica compartida, pendientes de implementar.
- src/app/models: tipos de datos, pendientes de validar con el backend.
- src/app/app.routes.ts: rutas.
- src/app/app.config.ts: providers.
- src/material-theme.scss y src/styles.css: tema Material y estilos comunes.
- docs/base-visual-fixcampus: guía visual y maqueta de referencia.
- docs/REFERENCIA-DEL-CURSO.md: configuración tomada de los ejemplos de la profesora.
- AGENTS.md: acuerdos para continuar el frontend.

## Trabajo en equipo

Cada integrante clona este repositorio y crea una rama para su historia. Antes de integrar, revisar los cambios y compilar. Las historias US52–US58 corresponden a Matías. Cada compañero desarrolla su módulo según el reparto del equipo.

La fuente local de referencia del curso es C:/Users/Matias/Documents/FRONTENTD- ARQUI WEB. Revisar los nuevos ejemplos de la profesora antes de introducir otra forma de trabajar.

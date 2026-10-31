# Frontend de FixCampus

## Instrucciones de Matías

- Este es el frontend del equipo. Repositorio: https://github.com/MatiasFloresDev/Fixcampus-Frontend.
- Carpeta local: C:/Users/Matias/Documents/FRONTENTD- ARQUI WEB/fixcampus-frontend.
- Antes de realizar trabajo frontend, revisar el material de la profesora en C:/Users/Matias/Documents/FRONTENTD- ARQUI WEB. La referencia inicial es semana10/demoFront8182. Volver a revisar si se agregan ejemplos nuevos.
- Seguir lo enseñado: Angular, componentes standalone con archivos TS/HTML/CSS separados, Router, servicios con HttpClient y Observable, modelos tipados y Angular Material. No sustituir el stack por React, Tailwind u otra biblioteca sin una instrucción expresa de Matías.
- Mantener la versión del curso. Actualmente los ejemplos de semana 10 usan Angular 22.2 y Material 22.2. No actualizar de versión mayor por iniciativa propia.
- Mantener las carpetas components, services y models. Las rutas se definen en app.routes.ts y los providers en app.config.ts.
- Conservar SSR e hidratación del ejemplo. Evitar acceder a window, document o localStorage sin considerar el servidor.
- Trabajar solo en las historias de Matías US52–US58, salvo autorización posterior. No implementar los módulos de los compañeros ni declarar sus historias terminadas.
- No inventar endpoints. Comprobar los controladores del backend antes de conectar una llamada.
- Reutilizar la base visual de docs/base-visual-fixcampus. Colores de marca #408F86, acción #0D6A62; Poppins para títulos y Open Sans para texto.
- No marcar como hecho lo que no tenga verificación. La pantalla inicial de este scaffold no implementa login ni registro.
- Ejecutar npm run build y npm test -- --watch=false antes de publicar cambios de lógica o configuración. No subir node_modules, dist, .angular, credenciales ni material ajeno al proyecto.

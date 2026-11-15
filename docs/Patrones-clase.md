# Referencia de clase

El backend de referencia es `PC2/demoSI/demoSI`. Angular se comparó con `PC2/pc2-flores/pc2_flores` y los ejemplos de demoFront.

Las pantallas conservan TS, HTML y CSS separados, clases DTO con valores iniciales, constructor, ngOnInit y propiedades normales. Los servicios usan HttpClient con Observable; los formularios usan FormBuilder, FormGroup y Validators. Las llamadas a los servicios se consumen con subscribe. Se utiliza Angular Material.

Las rutas ahora importan sus componentes y los declaran mediante component, como app.routes.ts de la PC2. Categorías, ubicaciones y roles tienen una ruta explícita cada uno; no se generan con Object.entries. Se retiró loadComponent del archivo de rutas.

Se eliminó CatalogoDTO.ts: mezclaba las propiedades de tres entidades y utilizaba Partial, Record, tipos de claves y metadatos para armar las pantallas. Ahora CategoriaDTO.ts, UbicacionDTO.ts y RolDTO.ts son clases con las propiedades y tipos reales de cada entidad, como el modelo CarbonFootprintAIDTO de la PC2. Cada clase DTO tiene su propio archivo. También se retiró Omit del servicio de recomendaciones y se sustituyó por RecomendacionFormularioDTO.

Categorías, ubicaciones y roles tienen cada uno su componente con TS/HTML/CSS, su servicio con Observable tipado y su DTO de formulario. Los controles y las columnas se escriben explícitamente en el HTML. Ya no se usan Catalogocomponent, Catalogoservice ni definiciones dinámicas de campos. El DTO de roles también se reutiliza en la pantalla de usuarios.

Las 29 pruebas de Angular comprobaron los flujos existentes, detalle en modo de lectura, edición, eliminación, protección de ADMIN/USUARIO, conservación de coordenadas con valor cero y validación de latitud/longitud juntas. Se mantienen los contratos JSON del backend.

Los guards de sesión y rol son necesarios para el acceso de FixCampus y siguen siendo funciones de Angular con inject. Gemini, Leaflet, los catálogos y la lógica de permisos son adaptaciones del proyecto, no funcionalidades del CRUD de una tabla del examen. Sus rutas, JSON y reglas se conservan.

Las fotografías añadidas se integraron en HTML y CSS. Sus créditos están en Fotografias.md.

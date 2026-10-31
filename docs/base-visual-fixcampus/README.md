# Base visual de FixCampus

Esta carpeta contiene la primera referencia visual común del equipo. Conserva la paleta, las tipografías y los recursos del proyecto actual. Es una propuesta para revisar entre todos.

## Archivos
- `index.html`: guía visual de colores, tipografía, componentes y reglas.
- `login.html`: maqueta responsive de la pantalla de acceso de Matías.
- `fixcampus.css`: valores y estilos de los componentes.
- `tokens.json`: colores, tamaños y espaciados en formato editable.
- `fonts.css` y `assets/fonts/`: tipografías locales, con sus licencias.
- `assets/logo.svg` y `assets/campus.svg`: recursos existentes de FixCampus.
- `login.js` y `guide.js`: interacciones del prototipo, sin conexión con la API.
- `capturas/`: referencias de escritorio, celular y estados.

Puedes abrir `index.html` directamente en un navegador. Para servir la carpeta en local:
```text
python -m http.server 8767
```
Abre http://localhost:8767. Las tipografías y los SVG están incluidos, por lo que la referencia no depende de una conexión externa.

## Decisiones compartidas

| Elemento | Regla |
|---|---|
| Marca | Verde #408F86 y azul #5C8FAA |
| Acción principal | Verde oscuro #0D6A62, texto blanco |
| Fondo | #F8F9FA; superficies blancas |
| Texto | #212529; texto secundario #5F6B70 |
| Títulos | Poppins, peso 600 |
| Texto y formularios | Open Sans |
| Espaciado | Escala de 4, 8, 12, 16, 24, 32, 48 y 64 px |
| Bordes | 8 px en controles, 14 px en paneles, 20 px en el contenedor de acceso |
| Controles | Objetivo táctil mínimo de 44 px; campos y botón principal móvil de 48 px |
| Móvil | Una columna; menú desde un botón; mensajes sin recortar |

El verde de marca y el azul de apoyo no se usan con texto blanco pequeño. Las acciones usan el verde oscuro para asegurar legibilidad. El contraste calculado de blanco sobre #0D6A62 es 6.45:1 y el de #5F6B70 sobre blanco es 5.49:1. Estas comprobaciones no sustituyen la revisión de accesibilidad de las pantallas finales.

## Componentes que todos reutilizan
- Botones principal, secundario, de apoyo y de eliminación.
- Estados de botón normal, hover, focus, deshabilitado y cargando.
- Campo normal, contraseña con mostrar/ocultar, selector, deshabilitado y error.
- Mensajes de información, éxito, error y sesión vencida.
- Etiquetas de estado y prioridad con texto.
- Tabla, carga y estado vacío.
- Navegación de visitante, USUARIO y ADMIN.
- Diálogo de confirmación y diálogo de registro como ejemplos.

## Pantallas de referencia
- Escritorio: 1440 × 1000 px, acceso con bloque de marca e ilustración junto al formulario.
- Celular: 390 × 844 px, formulario en una columna y menú desplegable.
- Estados de ejemplo: `login.html?estado=error`, `?estado=sesion` y `?estado=servidor`.

La maqueta no consulta el backend, no valida cuentas y no guarda contraseñas ni crea registros. Las respuestas son demostraciones visuales. El formulario pequeño de registro sirve para enseñar el uso de los mismos campos y mensajes.

## Cómo repartir su uso
1. Matías mantiene esta base y acuerda los cambios comunes con el equipo.
2. Cada integrante prepara los mockups de su módulo utilizando estos componentes.
3. En el archivo de diseño compartido, crear una página de “Componentes comunes” y una por integrante.
4. El detalle del reporte se compone una vez: José coordina su estructura, Matías la sección de evidencias y Mauricio comentarios/recomendaciones.
5. Revisar juntos escritorio, celular, teclado, validaciones y mensajes antes de pasar el diseño a implementación.

Esta entrega es la base común y la referencia de acceso de Matías. No representa mockups terminados ni implementación de los módulos de sus compañeros.

## Si el equipo trabaja en Figma o Canva
Recrear los componentes una sola vez a partir de los tamaños y colores de esta guía; reutilizar instancias en cada módulo. Las capturas incluidas son una referencia y los archivos HTML/CSS permiten ajustar medidas y estados.

## Integración con Angular
El frontend utiliza Angular Material. Esta carpeta es una guía y una maqueta independiente. Tras acordar el diseño, trasladar los valores a los estilos existentes y adaptar los componentes Material; no cargar dos hojas globales completas sin revisar conflictos.

## Recursos
La paleta, el logo y la ilustración proceden de `frontend/src/styles.css`, `frontend/public/logo.svg` y `frontend/public/img/campus.svg`. Las fuentes Poppins y Open Sans se distribuyen con sus licencias en `assets/fonts/`. Los datos de las tablas son ejemplos de diseño, no registros del sistema.

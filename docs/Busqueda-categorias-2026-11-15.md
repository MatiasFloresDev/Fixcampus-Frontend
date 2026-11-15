# Búsqueda de categorías

El formulario de incidencias consultaba categorías por descripción, pero no encontraba necesariamente una categoría al escribir su nombre. Los resultados solo aparecían al abrir el selector, y Mostrar todas no mostraba ninguna confirmación visible.

La búsqueda combina las coincidencias del nombre en el catálogo cargado con las de descripción que devuelve la API, sin duplicarlas. Presenta los resultados debajo del campo y permite pulsar una categoría para seleccionarla en el formulario. Se conserva la categoría elegida aunque no coincida con una búsqueda posterior.

Mostrar todas limpia el texto, restaura el catálogo y cancela cualquier búsqueda pendiente. Se muestran el total de resultados, el estado de búsqueda y un mensaje cuando no hay coincidencias. El campo ocupa todo el ancho; los botones usan Angular Material y la paleta verde existente. En pantallas pequeñas se apilan.

Se verificaron 24 pruebas de Angular y la compilación para producción. Las tres pruebas nuevas cubren búsqueda por nombre con respuesta vacía de la consulta por descripción, selección sin enviar el reporte, cancelación de una búsqueda pendiente, conservación de la selección y restauración tras una búsqueda sin resultados.

En Brave se comprobó la búsqueda de Electricidad, su selección y la restauración de las diez categorías disponibles en la base local. También se revisó la disposición estrecha sin desbordamiento horizontal. No se guardó ningún reporte durante la revisión.

- [Vista de escritorio](evidencias/categorias-busqueda.jpg).
- [Vista estrecha](evidencias/categorias-movil.jpg).

Se conservan los avisos anteriores de optimización del paquete inicial y Leaflet. No se cambió el backend.

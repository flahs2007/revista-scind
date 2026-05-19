Publicacion facil (sin servidor local)

Este sitio ya funciona con doble clic en index.html.
El contenido dinamico sale de: revistas/contenido.js

A) Publicar una nueva edicion (PDF)
1) Copia el PDF en: revistas/
   Ejemplo: vol7-2026.pdf
2) Abre revistas/contenido.js
3) En "editions", agrega un nuevo bloque al inicio.
4) Pon "current: true" en la nueva y "current: false" en la anterior.
5) Guarda y recarga la pagina.

B) Publicar un nuevo video
1) Copia el video en: revistas/videos/
   Ejemplo: visita-planta-2026.mp4
2) Abre revistas/contenido.js
3) En "videos", agrega un bloque nuevo:
   {
     title: "Titulo del video",
     description: "Descripcion corta",
     file: "visita-planta-2026.mp4"
   }
4) Guarda y recarga la pagina.

C) Gestor rapido dentro de la pagina
- En la seccion Videos, llena titulo/descripcion/archivo y pulsa "Agregar video".
- Eso guarda cambios en tu navegador (localStorage).
- Luego pulsa "Descargar contenido.js" para exportar tu version final.
- Reemplaza el archivo revistas/contenido.js por el descargado.

Nota:
- El nombre del archivo en "file" debe coincidir exactamente con el archivo real.

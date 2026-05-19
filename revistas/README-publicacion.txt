Publicacion facil (sin servidor local)

Este sitio funciona con doble clic en index.html.
El contenido dinamico sale de: revistas/contenido.js

Publicar una nueva edicion (PDF)
1) Copia el PDF en: revistas/
   Ejemplo: vol7-2026.pdf
2) Abre revistas/contenido.js
3) En "editions", agrega un nuevo bloque al inicio.
4) Pon "current: true" en la nueva y "current: false" en la anterior.
5) Guarda y recarga la pagina.

Nota:
- El nombre de "pdf" debe coincidir exactamente con el archivo real.

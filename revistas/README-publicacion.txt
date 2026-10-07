Publicacion super facil (sin formulario web)

Pasos:
1) Copia tus PDF dentro de la carpeta: revistas/
2) Ejecuta: actualizar-ediciones.cmd
3) Recarga index.html

Eso hace automaticamente:
- Detecta todos los PDF en revistas/
- Actualiza revistas/contenido.js
- Marca como edicion actual el PDF mas reciente

Formato recomendado de nombre PDF:
- Vol-7-2026.pdf
- Edicion-Especial-2026.pdf

Nota:
- El titulo se genera desde el nombre del archivo.
- Si quieres cambiar descripciones personalizadas, edita luego revistas/contenido.js

Si no hay PDFs en revistas/:
- La seccion "Ediciones" mostrara que no hay ediciones cargadas.

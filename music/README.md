# Música

Coloca aquí archivos de audio que tengas derecho a publicar y distribuir.

Para añadir canciones, edita `../assets/js/music-playlist.js` y agrega objetos con `title` y `src`, usando una ruta relativa desde la raíz del sitio. Por ejemplo:

```js
window.musicPlaylist = [
  { title: "Mi canción", src: "music/mi-cancion.mp3" }
];
```

La reproducción aleatoria intenta comenzar al abrir la página, pero los navegadores pueden bloquear el audio automático. En ese caso, el visitante debe pulsar reproducir. No agregues canciones a la lista hasta que sus archivos existan en esta carpeta.

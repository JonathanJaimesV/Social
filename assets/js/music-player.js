"use strict";

const musicPlayer = document.getElementById("music-player");

if (musicPlayer) {
  const audio = musicPlayer.querySelector("#music-audio");
  const titleElement = musicPlayer.querySelector("#music-title");
  const statusElement = musicPlayer.querySelector("#music-status");
  const hintElement = musicPlayer.querySelector("#music-hint");
  const toggleButton = musicPlayer.querySelector("#music-toggle");
  const nextButton = musicPlayer.querySelector("#music-next");
  const muteButton = musicPlayer.querySelector("#music-mute");
  const volumeInput = musicPlayer.querySelector("#music-volume");
  const configuredTracks = window.musicPlaylist;
  const isFileUrl = window.location.protocol === "file:";
  const tracks = Array.isArray(configuredTracks)
    ? configuredTracks.filter(track =>
      track &&
      typeof track.title === "string" &&
      track.title.trim() &&
      typeof track.src === "string" &&
      track.src.trim()
    )
    : [];
  const hasInvalidTracks = Array.isArray(configuredTracks) &&
    tracks.length !== configuredTracks.length;
  const failedTracks = new Set();
  let currentTrackIndex = -1;
  let playRequestId = 0;
  let shouldContinuePlaying = false;
  let userPaused = false;

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function updateTrack(index) {
    currentTrackIndex = index;
    titleElement.textContent = tracks[index].title.trim();
  }

  function chooseRandomTrack(retryFailedTracks) {
    let candidates = tracks
      .map((track, index) => index)
      .filter(index => !failedTracks.has(index));

    if (candidates.length === 0 && retryFailedTracks && failedTracks.size > 0) {
      failedTracks.clear();
      candidates = tracks.map((track, index) => index);
    }

    if (candidates.length > 1) {
      candidates = candidates.filter(index => index !== currentTrackIndex);
    }

    if (candidates.length === 0) {
      return -1;
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function updateVolume() {
    const volume = Number(volumeInput.value);
    audio.volume = volume;
    volumeInput.setAttribute("aria-valuetext", `${Math.round(volume * 100)}%`);
    volumeInput.style.setProperty("--volume-level", `${volume * 100}%`);
  }

  function handleTrackError(index) {
    if (failedTracks.has(index)) {
      return;
    }

    failedTracks.add(index);
    const errorMessage = isFileUrl
      ? `No se pudo cargar "${tracks[index].title.trim()}". Abre el sitio mediante HTTP/HTTPS, no como archivo local.`
      : `No se pudo cargar "${tracks[index].title.trim()}". Comprueba que el MP3 exista y la ruta sea correcta.`;
    setStatus(errorMessage);

    if (shouldContinuePlaying) {
      playRandomTrack(false);
    }
  }

  async function playTrack(index) {
    const track = tracks[index];
    if (!track) {
      return;
    }

    const requestId = ++playRequestId;
    userPaused = false;
    shouldContinuePlaying = true;
    audio.pause();
    updateTrack(index);
    musicPlayer.dataset.playing = "false";
    setStatus("Cargando canción...");
    audio.src = track.src.trim();
    audio.load();

    try {
      await audio.play();
    } catch (error) {
      if (requestId !== playRequestId) {
        return;
      }

      shouldContinuePlaying = false;
      musicPlayer.dataset.playing = "false";

      if (error.name === "NotAllowedError") {
        setStatus("El navegador bloqueó el inicio automático. Pulsa reproducir para escuchar.");
      } else {
        handleTrackError(index);
      }
    }
  }

  function playRandomTrack(retryFailedTracks) {
    const nextIndex = chooseRandomTrack(retryFailedTracks);
    if (nextIndex === -1) {
      shouldContinuePlaying = false;
      musicPlayer.dataset.playing = "false";
      setStatus(failedTracks.size === tracks.length
        ? "No se pudo reproducir ninguna canción. Comprueba los archivos y abre el sitio mediante HTTP/HTTPS."
        : "No hay canciones disponibles. Revisa los archivos y sus rutas.");
      return;
    }

    void playTrack(nextIndex);
  }

  toggleButton.addEventListener("click", () => {
    if (tracks.length === 0) {
      return;
    }

    if (!audio.paused) {
      userPaused = true;
      shouldContinuePlaying = false;
      audio.pause();
      return;
    }

    if (currentTrackIndex === -1) {
      playRandomTrack(true);
      return;
    }

    userPaused = false;
    shouldContinuePlaying = true;
    const requestId = ++playRequestId;
    setStatus("Reanudando canción...");
    audio.play().catch(error => {
      if (requestId !== playRequestId) {
        return;
      }

      shouldContinuePlaying = false;
      if (error.name === "NotAllowedError") {
        setStatus("Pulsa reproducir para autorizar el audio en este navegador.");
      } else {
        handleTrackError(currentTrackIndex);
      }
    });
  });

  nextButton.addEventListener("click", () => {
    if (tracks.length > 0) {
      playRandomTrack(true);
    }
  });

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteButton.setAttribute("aria-pressed", String(audio.muted));
    muteButton.setAttribute("aria-label", audio.muted ? "Activar sonido" : "Silenciar");
  });

  volumeInput.addEventListener("input", updateVolume);

  audio.addEventListener("play", () => {
    musicPlayer.dataset.playing = "true";
    toggleButton.setAttribute("aria-label", "Pausar música");
    toggleButton.setAttribute("aria-pressed", "true");
    setStatus("Reproduciendo");
  });

  audio.addEventListener("pause", () => {
    musicPlayer.dataset.playing = "false";
    toggleButton.setAttribute("aria-label", "Reproducir música");
    toggleButton.setAttribute("aria-pressed", "false");
    if (userPaused && currentTrackIndex !== -1) {
      setStatus("En pausa");
    }
  });

  audio.addEventListener("ended", () => {
    if (shouldContinuePlaying) {
      playRandomTrack(false);
    }
  });

  audio.addEventListener("error", () => {
    if (currentTrackIndex !== -1) {
      handleTrackError(currentTrackIndex);
    }
  });

  updateVolume();

  if (tracks.length === 0) {
    titleElement.textContent = "Sin canciones todavía";
    setStatus(hasInvalidTracks || !Array.isArray(configuredTracks)
      ? "La lista no es válida. Revisa assets/js/music-playlist.js."
      : "Agrega archivos de audio a la lista para empezar.");
    toggleButton.disabled = true;
    nextButton.disabled = true;
  } else {
    hintElement.hidden = true;
    toggleButton.disabled = false;
    nextButton.disabled = tracks.length < 2;
    titleElement.textContent = "Eligiendo una canción aleatoria...";
    setStatus("Intentando iniciar la reproducción...");
    playRandomTrack(false);
  }
}

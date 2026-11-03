"use client";

/**
 * One shared <audio> element for the whole page, so the hero, the "Hear it" strip and the popover replica
 * never talk over each other. It is created lazily on the first play, so nothing downloads until a click.
 */

export const DEFAULT_SOUND = "/tanki.mp3";

type Snapshot = { playing: boolean; owner: string | null };

let audio: HTMLAudioElement | null = null;
let loopsLeft = 0;
let snapshot: Snapshot = { playing: false, owner: null };
const listeners = new Set<() => void>();

function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "auto";
  audio.addEventListener("ended", () => {
    if (!audio) return;
    if (loopsLeft > 1) {
      loopsLeft -= 1;
      audio.currentTime = 0;
      void audio.play();
      return;
    }
    emit({ playing: false, owner: snapshot.owner });
  });
  audio.addEventListener("pause", () => {
    if (audio && !audio.ended) emit({ playing: false, owner: snapshot.owner });
  });
  return audio;
}

export const sound = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: () => snapshot,
  get element() {
    return audio;
  },
  async play({
    src = DEFAULT_SOUND,
    loops = 1,
    owner,
    from = 0,
  }: {
    src?: string;
    loops?: number;
    owner: string;
    from?: number;
  }) {
    const a = ensureAudio();
    const abs = new URL(src, window.location.href).href;
    if (a.src !== abs) a.src = src;
    a.currentTime = from;
    loopsLeft = Math.max(1, loops);
    emit({ playing: true, owner });
    try {
      await a.play();
    } catch {
      // Autoplay policy or an unreadable file: reflect the real state.
      emit({ playing: false, owner });
    }
  },
  stop() {
    if (!audio) return;
    loopsLeft = 0;
    audio.pause();
    audio.currentTime = 0;
    emit({ playing: false, owner: snapshot.owner });
  },
};

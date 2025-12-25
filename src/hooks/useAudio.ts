import { useState, useRef, useCallback, useEffect } from 'react';
import mariahCareyMusic from '../audio/mariah-carey.mp3';

const REMOTE_MUSIC = '';
const REMOTE_WIND = '';

const LOCAL_MUSIC = mariahCareyMusic;
const LOCAL_WIND = mariahCareyMusic; // Add your local wind audio if available

export interface AudioControls {
  isMuted: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  toggleMute: () => void;
  startAudio: () => Promise<void>;
}

export function useAudio(): AudioControls {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const windRef = useRef<HTMLAudioElement | null>(null);

  const musicFallbackUsed = useRef(false);
  const windFallbackUsed = useRef(false);
  const fadeTimer = useRef<number>();

  useEffect(() => {
    const music = new Audio(REMOTE_MUSIC);
    music.loop = true;
    music.volume = 0;

    const wind = LOCAL_WIND ? new Audio(REMOTE_WIND) : null;
    if (wind) {
      wind.loop = true;
      wind.volume = 0;
    }

    const handleMusicError = () => {
      if (!musicFallbackUsed.current) {
        musicFallbackUsed.current = true;
        music.src = LOCAL_MUSIC;
        music.load();
      } else {
        console.warn('Music disabled');
      }
    };

    const handleWindError = () => {
      if (!wind) return;
      if (!windFallbackUsed.current) {
        windFallbackUsed.current = true;
        if (LOCAL_WIND) {
          wind.src = LOCAL_WIND;
          wind.load();
        } else {
          console.warn('Wind disabled');
        }
      }
    };

    music.addEventListener('error', handleMusicError);
    if (wind) wind.addEventListener('error', handleWindError);

    musicRef.current = music;
    windRef.current = wind;

    return () => {
      music.pause();
      if (wind) wind.pause();
      music.removeEventListener('error', handleMusicError);
      if (wind) wind.removeEventListener('error', handleWindError);
      if (fadeTimer.current) clearInterval(fadeTimer.current);
    };
  }, []);

  const fadeIn = useCallback(() => {
    const music = musicRef.current;
    const wind = windRef.current;
    if (!music) return;

    let step = 0;
    const max = 60;

    fadeTimer.current = window.setInterval(() => {
      step++;
      music.volume = Math.min(step / max * 0.4, 0.4);
      if (wind) wind.volume = Math.min(step / max * 0.15, 0.15);
      if (step >= max && fadeTimer.current) {
        clearInterval(fadeTimer.current);
      }
    }, 50);
  }, []);

  const startAudio = useCallback(async () => {
    const music = musicRef.current;
    const wind = windRef.current;
    if (!music) return;

    setIsLoading(true);
    try {
      const plays: Promise<void>[] = [music.play()];
      if (wind) plays.push(wind.play());
      await Promise.all(plays);

      setIsMuted(false);
      setIsPlaying(true);
      fadeIn();
    } catch {
      console.warn('Autoplay blocked: user interaction required');
      setIsMuted(true);
    } finally {
      setIsLoading(false);
    }
  }, [fadeIn]);

  const toggleMute = useCallback(() => {
    const music = musicRef.current;
    const wind = windRef.current;
    if (!music) return;

    if (isMuted) {
      startAudio();
    } else {
      music.volume = 0;
      if (wind) wind.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, startAudio]);

  return {
    isMuted,
    isPlaying,
    isLoading,
    toggleMute,
    startAudio,
  };
}

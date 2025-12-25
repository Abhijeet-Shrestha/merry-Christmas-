import { useState, useRef, useCallback, useEffect } from 'react';

// Reliable royalty-free Christmas music URLs
const CHRISTMAS_MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3';
const WIND_AMBIENCE_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-blizzard-cold-wind-1153.mp3';

export interface AudioControls {
  isMuted: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  toggleMute: () => void;
  startAudio: () => Promise<void>;
  fadeIn: (duration?: number) => void;
}

export function useAudio(): AudioControls {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Initialize audio elements
  useEffect(() => {
    const music = new Audio();
    music.crossOrigin = 'anonymous';
    music.loop = true;
    music.volume = 0;
    music.preload = 'auto';
    music.src = CHRISTMAS_MUSIC_URL;
    musicRef.current = music;
    
    const ambience = new Audio();
    ambience.crossOrigin = 'anonymous';
    ambience.loop = true;
    ambience.volume = 0;
    ambience.preload = 'auto';
    ambience.src = WIND_AMBIENCE_URL;
    ambienceRef.current = ambience;

    // Preload audio
    music.load();
    ambience.load();

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      musicRef.current?.pause();
      ambienceRef.current?.pause();
    };
  }, []);

  const fadeIn = useCallback((duration: number = 3000) => {
    const music = musicRef.current;
    const ambience = ambienceRef.current;
    if (!music || !ambience) return;

    const targetMusicVolume = 0.4;
    const targetAmbienceVolume = 0.15;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      music.volume = Math.min(easeProgress * targetMusicVolume, targetMusicVolume);
      ambience.volume = Math.min(easeProgress * targetAmbienceVolume, targetAmbienceVolume);

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  }, []);

  const startAudio = useCallback(async () => {
    const music = musicRef.current;
    const ambience = ambienceRef.current;
    if (!music || !ambience) return;

    setIsLoading(true);
    
    try {
      await Promise.all([
        music.play(),
        ambience.play()
      ]);
      setIsPlaying(true);
      setIsMuted(false);
      fadeIn(4000);
    } catch (error) {
      console.log('Audio autoplay blocked, waiting for user interaction');
    } finally {
      setIsLoading(false);
    }
  }, [fadeIn]);

  const toggleMute = useCallback(() => {
    const music = musicRef.current;
    const ambience = ambienceRef.current;
    if (!music || !ambience) return;

    if (isMuted) {
      if (!isPlaying) {
        startAudio();
      } else {
        music.volume = 0.4;
        ambience.volume = 0.15;
        setIsMuted(false);
      }
    } else {
      music.volume = 0;
      ambience.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, isPlaying, startAudio]);

  return {
    isMuted,
    isPlaying,
    isLoading,
    toggleMute,
    startAudio,
    fadeIn,
  };
}

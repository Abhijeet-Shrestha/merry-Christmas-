import { useState, useRef, useCallback, useEffect } from 'react';

// Royalty-free Christmas music URLs
const CHRISTMAS_MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const WIND_AMBIENCE_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3';

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
    musicRef.current = new Audio(CHRISTMAS_MUSIC_URL);
    musicRef.current.loop = true;
    musicRef.current.volume = 0;
    
    ambienceRef.current = new Audio(WIND_AMBIENCE_URL);
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = 0;

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

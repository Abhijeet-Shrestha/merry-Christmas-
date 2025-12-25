import { useState, useEffect, useCallback } from 'react';

export interface ParallaxState {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useParallax(): ParallaxState {
  const [state, setState] = useState<ParallaxState>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    const normalizedX = (x / window.innerWidth - 0.5) * 2;
    const normalizedY = (y / window.innerHeight - 0.5) * 2;
    
    setState({ x, y, normalizedX, normalizedY });
  }, []);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    
    // gamma: left/right tilt (-90 to 90)
    // beta: front/back tilt (-180 to 180)
    const normalizedX = Math.max(-1, Math.min(1, e.gamma / 30));
    const normalizedY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    
    setState(prev => ({
      ...prev,
      normalizedX,
      normalizedY,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    
    // Request permission for device orientation on iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // Don't auto-request, would need user interaction
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [handleMouseMove, handleDeviceOrientation]);

  return state;
}

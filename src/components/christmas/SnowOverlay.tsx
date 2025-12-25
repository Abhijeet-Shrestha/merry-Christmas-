import { useMemo } from 'react';

interface Snowflake {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
  size: string;
}

export function SnowOverlay() {
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${8 + Math.random() * 12}s`,
      animationDelay: `${-Math.random() * 10}s`,
      opacity: 0.3 + Math.random() * 0.7,
      size: `${2 + Math.random() * 4}px`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-christmas-snow animate-snow-fall"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}

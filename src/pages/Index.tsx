import { useState, useEffect, useCallback } from 'react';
import { ChristmasScene } from '@/components/christmas/ChristmasScene';
import { GreetingText } from '@/components/christmas/GreetingText';
import { AudioControl } from '@/components/christmas/AudioControl';
import { StartOverlay } from '@/components/christmas/StartOverlay';
import { SnowOverlay } from '@/components/christmas/SnowOverlay';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useAudio } from '@/hooks/useAudio';

interface AnimationState {
  started: boolean;
  progress: number;
  showText: boolean;
  showSubtitle: boolean;
  showSender: boolean;
  lightsOn: boolean;
}

const Index = () => {
  const { from, to } = usePersonalization();
  const audio = useAudio();
  
  const [animationState, setAnimationState] = useState<AnimationState>({
    started: false,
    progress: 0,
    showText: false,
    showSubtitle: false,
    showSender: false,
    lightsOn: false,
  });

  // Animation timeline
  useEffect(() => {
    if (!animationState.started) return;

    const timeline = [
      { time: 3000, action: () => setAnimationState(s => ({ ...s, progress: 30 })) },
      { time: 6000, action: () => setAnimationState(s => ({ ...s, lightsOn: true })) },
      { time: 8000, action: () => setAnimationState(s => ({ ...s, showText: true })) },
      { time: 11000, action: () => setAnimationState(s => ({ ...s, showSubtitle: true })) },
      { time: 14000, action: () => setAnimationState(s => ({ ...s, showSender: true })) },
    ];

    const timeouts = timeline.map(({ time, action }) => 
      setTimeout(action, time)
    );

    // Progress animation
    let startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setAnimationState(s => ({ 
        ...s, 
        progress: Math.min(elapsed / 100, 100) 
      }));
    }, 50);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [animationState.started, audio]);

  const handleStart = useCallback(() => {
    // Play audio as a direct result of user interaction to avoid autoplay blocking
    audio.startAudio().catch(() => {});
    setAnimationState(s => ({ ...s, started: true }));
  }, []);

  return (
    <>
      {/* SEO - Hidden for screen readers but visible to crawlers */}
      <header className="sr-only">
        <h1>Merry Christmas Greeting from {from}</h1>
        {to && <p>A special Christmas message for {to}</p>}
      </header>

      <main 
        className="relative w-full h-screen overflow-hidden christmas-gradient"
        role="main"
        aria-label="Christmas greeting experience"
      >
        {/* Background aurora effect */}
        <div className="absolute inset-0 aurora-overlay pointer-events-none" />
        
        {/* 3D Scene */}
        <ChristmasScene 
          animationProgress={animationState.progress}
          lightsOn={animationState.lightsOn}
        />
        
        {/* CSS Snow Overlay (backup for 3D snow) */}
        <SnowOverlay />
        
        {/* Greeting Text */}
        <GreetingText
          isVisible={animationState.showText}
          recipientName={to}
          senderName={from}
          showSubtitle={animationState.showSubtitle}
          showSender={animationState.showSender}
        />
        
        {/* Start Overlay */}
        <StartOverlay 
          isVisible={!animationState.started}
          onStart={handleStart}
        />
        
        {/* Audio Control */}
        {animationState.started && (
          <AudioControl
            isMuted={audio.isMuted}
            isLoading={audio.isLoading}
            onToggle={audio.toggleMute}
          />
        )}

        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--christmas-night-deep)) 100%)',
          }}
          aria-hidden="true"
        />
      </main>

      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": `Merry Christmas from ${from}`,
          "description": `A personalized Christmas greeting${to ? ` for ${to}` : ''} from ${from}. Wishing you peace, love, and joy this holiday season.`,
          "author": {
            "@type": "Person",
            "name": from
          }
        })
      }} />
    </>
  );
};

export default Index;

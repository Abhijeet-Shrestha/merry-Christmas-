import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GreetingTextProps {
  isVisible: boolean;
  recipientName: string | null;
  senderName: string;
  showSubtitle: boolean;
  showSender: boolean;
}

export function GreetingText({ 
  isVisible, 
  recipientName, 
  senderName, 
  showSubtitle, 
  showSender 
}: GreetingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const senderRef = useRef<HTMLParagraphElement>(null);
  const recipientRef = useRef<HTMLParagraphElement>(null);

  // Animate title letter by letter
  useEffect(() => {
    if (!isVisible || !titleRef.current) return;

    const title = titleRef.current;
    const text = "Merry Christmas";
    title.innerHTML = '';
    
    // Create spans for each letter
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(30px)';
      title.appendChild(span);
    });

    // Animate each letter
    const spans = title.querySelectorAll('span');
    gsap.to(spans, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(1.7)',
    });
  }, [isVisible]);

  // Animate subtitle
  useEffect(() => {
    if (!showSubtitle || !subtitleRef.current) return;

    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
  }, [showSubtitle]);

  // Animate sender
  useEffect(() => {
    if (!showSender || !senderRef.current) return;

    gsap.fromTo(
      senderRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
  }, [showSender]);

  // Animate recipient
  useEffect(() => {
    if (!recipientName || !recipientRef.current || !isVisible) return;

    gsap.fromTo(
      recipientRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
    );
  }, [recipientName, isVisible]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4"
    >
      <div className="text-center max-w-4xl">
        {/* Recipient greeting */}
        {recipientName && (
          <p 
            ref={recipientRef}
            className="font-elegant text-2xl md:text-3xl text-christmas-frost mb-4 opacity-0"
            style={{ letterSpacing: '0.1em' }}
          >
            Dear {recipientName},
          </p>
        )}

        {/* Main title */}
        <h1 
          ref={titleRef}
          className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-glow-gold mb-6"
          style={{ 
            color: 'hsl(var(--christmas-gold))',
            lineHeight: 1.2,
          }}
          aria-label="Merry Christmas"
        >
          Merry Christmas
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className={`font-elegant text-xl md:text-2xl lg:text-3xl text-christmas-frost mb-8 transition-opacity duration-500 ${
            showSubtitle ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            letterSpacing: '0.05em',
            textShadow: '0 0 20px rgba(255,255,255,0.3)'
          }}
        >
          May your holidays be filled with peace, love & joy
        </p>

        {/* Sender */}
        <p 
          ref={senderRef}
          className={`font-script text-3xl md:text-4xl lg:text-5xl transition-opacity duration-500 ${
            showSender ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            color: 'hsl(var(--christmas-gold-glow))',
            textShadow: '0 0 30px hsl(var(--christmas-gold) / 0.5)'
          }}
        >
          — From {senderName}
        </p>
      </div>
    </div>
  );
}

import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartOverlayProps {
  onStart: () => void;
  isVisible: boolean;
}

export function StartOverlay({ onStart, isVisible }: StartOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center christmas-gradient">
      <div className="text-center px-4">
        <h2 className="font-script text-4xl md:text-6xl text-christmas-gold text-glow-gold mb-4">
          A Special Greeting
        </h2>
        <p className="font-elegant text-lg md:text-xl text-christmas-frost mb-8 max-w-md mx-auto">
          Click to experience a magical Christmas moment
        </p>
        <Button
          onClick={onStart}
          size="lg"
          className="group relative overflow-hidden bg-christmas-gold/20 hover:bg-christmas-gold/30 border-2 border-christmas-gold text-christmas-gold rounded-full px-8 py-6 text-lg font-display transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Play className="w-6 h-6 fill-current" />
            Begin Experience
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-christmas-gold/0 via-christmas-gold/20 to-christmas-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </Button>
        <p className="font-elegant text-sm text-muted-foreground mt-6">
          🔊 Best experienced with sound
        </p>
      </div>
    </div>
  );
}

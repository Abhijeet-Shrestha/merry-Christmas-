import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlProps {
  isMuted: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function AudioControl({ isMuted, isLoading, onToggle }: AudioControlProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-christmas-night/80 backdrop-blur-sm border border-christmas-gold/30 hover:bg-christmas-night hover:border-christmas-gold/50 transition-all duration-300 group"
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-christmas-gold animate-spin" />
      ) : isMuted ? (
        <VolumeX className="w-5 h-5 text-christmas-frost group-hover:text-christmas-gold transition-colors" />
      ) : (
        <Volume2 className="w-5 h-5 text-christmas-gold animate-pulse" />
      )}
    </Button>
  );
}

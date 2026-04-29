import { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';

interface ScanAnimationProps {
  imageSrc: string;
  onComplete?: () => void;
  duration?: number;
}

export function ScanAnimation({ imageSrc, onComplete, duration = 3000 }: ScanAnimationProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
          return 100;
        }
        return prev + 100 / (duration / 50);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-xl">
      <img src={imageSrc} alt="פריט לסריקה" className="w-full aspect-square object-cover" />
      {!isComplete && (
        <>
          <div className="absolute inset-0 bg-black/40 transition-all duration-100" style={{ height: `${scanProgress}%` }} />
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ top: `${scanProgress}%` }}>
            <div className="absolute inset-0 bg-primary blur-md" />
          </div>
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Scan size={64} className="text-primary animate-pulse" />
          </div>
        </>
      )}
      {isComplete && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="bg-white rounded-full p-4 shadow-xl animate-bounce">
            <span className="text-4xl">✅</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
        <div className="h-full bg-primary transition-all duration-100" style={{ width: `${scanProgress}%` }} />
      </div>
    </div>
  );
}
